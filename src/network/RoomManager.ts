import { Peer, DataConnection } from 'peerjs';
import { GameState, MatchConfig } from '../engine/Types';
import {
  NetworkMessage,
  RoomSlotInfo,
  SyncStateMessage,
  RoomUpdateMessage,
  StartGameMessage,
  SendEmoteMessage,
} from './Protocol';
import { COLOR_ORDER } from '../engine/BoardTopology';

export type RoomRole = 'host' | 'client' | 'standalone';

export class RoomManager {
  private peer: Peer | null = null;
  private connections: Map<string, DataConnection> = new Map();
  private hostConnection: DataConnection | null = null;
  private roomCode: string | null = null;
  private role: RoomRole = 'standalone';
  private localPlayerIndex: number = 0;
  private localPlayerName: string = 'You';

  // Room Lobby State (for host and client)
  private roomSlots: RoomSlotInfo[] = [];

  // Callbacks
  private onStateReceivedCallback: ((state: GameState) => void) | null = null;
  private onRoomUpdatedCallback: ((slots: RoomSlotInfo[], canStart: boolean, roomCode: string) => void) | null = null;
  private onGameStartedCallback: ((config: MatchConfig, initialState: GameState) => void) | null = null;
  private onRollRequestedCallback: ((playerIndex: number) => void) | null = null;
  private onMoveRequestedCallback: ((playerIndex: number, tokenId: string) => void) | null = null;
  private onEmoteReceivedCallback: ((playerIndex: number, emoji: string, label?: string) => void) | null = null;
  private onDisconnectedCallback: ((reason: string) => void) | null = null;

  public onStateReceived(cb: (state: GameState) => void): void {
    this.onStateReceivedCallback = cb;
  }

  public onRoomUpdated(cb: (slots: RoomSlotInfo[], canStart: boolean, roomCode: string) => void): void {
    this.onRoomUpdatedCallback = cb;
  }

  public onGameStarted(cb: (config: MatchConfig, initialState: GameState) => void): void {
    this.onGameStartedCallback = cb;
  }

  public onRollRequested(cb: (playerIndex: number) => void): void {
    this.onRollRequestedCallback = cb;
  }

  public onMoveRequested(cb: (playerIndex: number, tokenId: string) => void): void {
    this.onMoveRequestedCallback = cb;
  }

  public onEmoteReceived(cb: (playerIndex: number, emoji: string, label?: string) => void): void {
    this.onEmoteReceivedCallback = cb;
  }

  public onDisconnected(cb: (reason: string) => void): void {
    this.onDisconnectedCallback = cb;
  }

  public getRole(): RoomRole {
    return this.role;
  }

  public getRoomCode(): string | null {
    return this.roomCode;
  }

  public getLocalPlayerIndex(): number {
    return this.localPlayerIndex;
  }

  public getLocalPlayerName(): string {
    return this.localPlayerName;
  }

  public getRoomSlots(): RoomSlotInfo[] {
    return this.roomSlots;
  }

  /**
   * Hosts a new WebRTC room with a clean 6-character room code.
   */
  public async hostRoom(hostName: string = 'Host'): Promise<string> {
    this.cleanup();
    this.role = 'host';
    this.localPlayerIndex = 0;
    this.localPlayerName = hostName;

    // Generate random 6-character uppercase code
    const rawCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const peerId = `ludo-room-${rawCode}`;
    this.roomCode = rawCode;

    // Initialize 4 human slots: Slot 0 is Host (You), slots 1..3 are Open Seats waiting for real players
    this.roomSlots = COLOR_ORDER.map((color, idx) => ({
      peerId: idx === 0 ? peerId : '',
      playerIndex: idx,
      name: idx === 0 ? hostName : `Waiting for player...`,
      color,
      isHost: idx === 0,
      isReady: idx === 0,
      isBot: false,
    }));

    return new Promise((resolve, reject) => {
      try {
        this.peer = new Peer(peerId, {
          debug: 1,
        });

        this.peer.on('open', () => {
          this.setupHostListeners();
          this.notifyRoomUpdated();
          resolve(rawCode);
        });

        this.peer.on('error', (err) => {
          console.error('Peer host error:', err);
          reject(err);
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Joins an existing WebRTC room via 6-character room code.
   */
  public async joinRoom(code: string, playerName: string = 'Player'): Promise<number> {
    this.cleanup();
    this.role = 'client';
    this.roomCode = code.toUpperCase();
    this.localPlayerName = playerName;
    const peerId = `ludo-guest-${Math.random().toString(36).substring(2, 8)}`;

    return new Promise((resolve, reject) => {
      try {
        this.peer = new Peer(peerId, {
          debug: 1,
        });

        const timeout = setTimeout(() => {
          reject(new Error('Connection timed out. Please verify room code.'));
        }, 12000);

        this.peer.on('open', () => {
          const hostPeerId = `ludo-room-${this.roomCode}`;
          const conn = this.peer!.connect(hostPeerId, {
            reliable: true,
          });

          conn.on('open', () => {
            clearTimeout(timeout);
            this.hostConnection = conn;
            this.setupClientListeners();

            // Send Join Request to Host
            conn.send({
              type: 'JOIN_REQUEST',
              senderId: this.peer!.id,
              playerName,
              timestamp: Date.now(),
            } as NetworkMessage);
          });

          conn.on('data', (data) => {
            const msg = data as NetworkMessage;
            if (msg.type === 'JOIN_ACCEPT') {
              this.localPlayerIndex = msg.assignedPlayerIndex;
              this.roomSlots = msg.slots;
              this.notifyRoomUpdated();
              resolve(msg.assignedPlayerIndex);
            } else if (msg.type === 'JOIN_REJECT') {
              clearTimeout(timeout);
              reject(new Error(msg.reason || 'Room is full'));
            }
          });

          conn.on('error', (err) => {
            clearTimeout(timeout);
            reject(err);
          });
        });

        this.peer.on('error', (err) => {
          clearTimeout(timeout);
          reject(err);
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Host starts the game and broadcasts config & state.
   */
  public hostStartGame(engineState: GameState, config: MatchConfig): void {
    if (this.role !== 'host') return;

    const message: StartGameMessage = {
      type: 'START_GAME',
      senderId: this.peer?.id || 'host',
      config,
      initialState: engineState,
      timestamp: Date.now(),
    };

    this.broadcast(message);
    if (this.onGameStartedCallback) {
      this.onGameStartedCallback(config, engineState);
    }
  }

  /**
   * Toggle a slot between Bot and Open human seat (Host only).
   */
  public hostToggleSlotBot(slotIndex: number): void {
    if (this.role !== 'host' || slotIndex <= 0 || slotIndex >= 4) return;
    const slot = this.roomSlots[slotIndex];
    if (slot.peerId && !slot.isBot) {
      // Disconnect remote human if kicked to bot
      const conn = this.connections.get(slot.peerId);
      if (conn) conn.close();
      this.connections.delete(slot.peerId);
    }

    slot.isBot = !slot.isBot;
    slot.peerId = slot.isBot ? '' : '';
    slot.name = slot.isBot ? `Bot ${slotIndex}` : `Waiting...`;
    slot.isReady = true;

    this.notifyRoomUpdated();
    this.broadcastRoomUpdate();
  }

  /**
   * Client sends ready toggle to host.
   */
  public sendReadyToggle(isReady: boolean): void {
    if (this.role === 'client' && this.hostConnection && this.hostConnection.open) {
      this.hostConnection.send({
        type: 'PLAYER_READY',
        senderId: this.peer ? this.peer.id : 'client',
        playerIndex: this.localPlayerIndex,
        isReady,
        timestamp: Date.now(),
      } as NetworkMessage);
    }
  }

  /**
   * Broadcasts game state to all connected peers (Host only).
   */
  public broadcastState(state: GameState): void {
    if (this.role !== 'host') return;

    const message: SyncStateMessage = {
      type: 'SYNC_STATE',
      senderId: this.peer ? this.peer.id : 'host',
      state,
      timestamp: Date.now(),
    };

    this.broadcast(message);
  }

  /**
   * Sends dice roll request.
   */
  public sendRollRequest(): void {
    if (this.role === 'client' && this.hostConnection && this.hostConnection.open) {
      this.hostConnection.send({
        type: 'CLIENT_ROLL_DICE',
        senderId: this.peer ? this.peer.id : 'client',
        playerIndex: this.localPlayerIndex,
        timestamp: Date.now(),
      } as NetworkMessage);
    }
  }

  /**
   * Sends token move request.
   */
  public sendMoveRequest(tokenId: string): void {
    if (this.role === 'client' && this.hostConnection && this.hostConnection.open) {
      this.hostConnection.send({
        type: 'CLIENT_MOVE_TOKEN',
        senderId: this.peer ? this.peer.id : 'client',
        playerIndex: this.localPlayerIndex,
        tokenId,
        timestamp: Date.now(),
      } as NetworkMessage);
    }
  }

  /**
   * Sends an emote/reaction to all players in the room.
   */
  public sendEmote(emoji: string, label?: string): void {
    const msg: SendEmoteMessage = {
      type: 'SEND_EMOTE',
      senderId: this.peer ? this.peer.id : 'local',
      playerIndex: this.localPlayerIndex,
      emoji,
      label,
      timestamp: Date.now(),
    };

    if (this.role === 'host') {
      this.broadcast(msg);
      if (this.onEmoteReceivedCallback) {
        this.onEmoteReceivedCallback(this.localPlayerIndex, emoji, label);
      }
    } else if (this.role === 'client' && this.hostConnection && this.hostConnection.open) {
      this.hostConnection.send(msg);
      if (this.onEmoteReceivedCallback) {
        this.onEmoteReceivedCallback(this.localPlayerIndex, emoji, label);
      }
    }
  }

  private setupHostListeners(): void {
    if (!this.peer) return;

    this.peer.on('connection', (conn) => {
      this.connections.set(conn.peer, conn);

      conn.on('data', (data) => {
        const msg = data as NetworkMessage;
        this.handleHostIncomingMessage(conn, msg);
      });

      conn.on('close', () => {
        this.handleClientDisconnect(conn.peer);
      });

      conn.on('error', (err) => {
        console.warn('Host conn error:', err);
      });
    });
  }

  private setupClientListeners(): void {
    if (!this.hostConnection) return;

    this.hostConnection.on('data', (data) => {
      const msg = data as NetworkMessage;
      if (msg.type === 'SYNC_STATE') {
        if (this.onStateReceivedCallback) {
          this.onStateReceivedCallback(msg.state);
        }
      } else if (msg.type === 'ROOM_UPDATE') {
        this.roomSlots = msg.slots;
        this.notifyRoomUpdated();
      } else if (msg.type === 'START_GAME') {
        if (this.onGameStartedCallback) {
          this.onGameStartedCallback(msg.config, msg.initialState);
        }
      } else if (msg.type === 'SEND_EMOTE') {
        if (this.onEmoteReceivedCallback) {
          this.onEmoteReceivedCallback(msg.playerIndex, msg.emoji, msg.label);
        }
      }
    });

    this.hostConnection.on('close', () => {
      if (this.onDisconnectedCallback) {
        this.onDisconnectedCallback('Host disconnected');
      }
    });
  }

  private handleHostIncomingMessage(conn: DataConnection, msg: NetworkMessage): void {
    if (msg.type === 'JOIN_REQUEST') {
      // Find first empty seat waiting for a human player
      const availableSlot = this.roomSlots.find((s, idx) => idx > 0 && !s.peerId);

      if (!availableSlot) {
        conn.send({
          type: 'JOIN_REJECT',
          senderId: this.peer!.id,
          reason: 'Room is full (4/4 players)',
          timestamp: Date.now(),
        } as NetworkMessage);
        return;
      }

      availableSlot.peerId = conn.peer;
      availableSlot.name = msg.playerName || `Player ${availableSlot.playerIndex + 1}`;
      availableSlot.isBot = false;
      availableSlot.isReady = true;

      // Send JOIN_ACCEPT back to the guest
      conn.send({
        type: 'JOIN_ACCEPT',
        senderId: this.peer!.id,
        assignedPlayerIndex: availableSlot.playerIndex,
        roomCode: this.roomCode!,
        slots: this.roomSlots,
        timestamp: Date.now(),
      } as NetworkMessage);

      // Broadcast update to all connected players
      this.notifyRoomUpdated();
      this.broadcastRoomUpdate();
    } else if (msg.type === 'PLAYER_READY') {
      const slot = this.roomSlots[msg.playerIndex];
      if (slot) {
        slot.isReady = msg.isReady;
        this.notifyRoomUpdated();
        this.broadcastRoomUpdate();
      }
    } else if (msg.type === 'CLIENT_ROLL_DICE') {
      if (this.onRollRequestedCallback) {
        this.onRollRequestedCallback(msg.playerIndex);
      }
    } else if (msg.type === 'CLIENT_MOVE_TOKEN') {
      if (this.onMoveRequestedCallback) {
        this.onMoveRequestedCallback(msg.playerIndex, msg.tokenId);
      }
    } else if (msg.type === 'SEND_EMOTE') {
      this.broadcast(msg);
      if (this.onEmoteReceivedCallback) {
        this.onEmoteReceivedCallback(msg.playerIndex, msg.emoji, msg.label);
      }
    }
  }

  private handleClientDisconnect(peerId: string): void {
    this.connections.delete(peerId);
    const slot = this.roomSlots.find((s) => s.peerId === peerId);
    if (slot) {
      slot.peerId = '';
      slot.isBot = false;
      slot.name = `Waiting for player...`;
      slot.isReady = false;
      this.notifyRoomUpdated();
      this.broadcastRoomUpdate();
    }
  }

  private broadcast(msg: NetworkMessage): void {
    for (const conn of this.connections.values()) {
      if (conn.open) {
        conn.send(msg);
      }
    }
  }

  private broadcastRoomUpdate(): void {
    if (this.role !== 'host') return;
    const connectedCount = this.roomSlots.filter((s) => s.isHost || Boolean(s.peerId)).length;
    const msg: RoomUpdateMessage = {
      type: 'ROOM_UPDATE',
      senderId: this.peer ? this.peer.id : 'host',
      roomCode: this.roomCode || '',
      slots: this.roomSlots,
      canStart: connectedCount >= 2,
      timestamp: Date.now(),
    };
    this.broadcast(msg);
  }

  private notifyRoomUpdated(): void {
    if (this.onRoomUpdatedCallback) {
      const connectedCount = this.roomSlots.filter((s) => s.isHost || Boolean(s.peerId)).length;
      this.onRoomUpdatedCallback(this.roomSlots, connectedCount >= 2, this.roomCode || '');
    }
  }

  public createOnlineMatchConfig(theme: import('../engine/Types').BoardTheme = 'obsidian'): MatchConfig {
    // Strictly include connected real human players (no bots)
    const connectedSlots = this.roomSlots.filter((slot) => slot.isHost || Boolean(slot.peerId));

    const slots = connectedSlots.map((roomSlot) => {
      const type = roomSlot.isHost ? 'local_human' : 'remote_player';
      return {
        color: roomSlot.color,
        name: roomSlot.name,
        type: type as 'local_human' | 'remote_player',
        difficulty: 'balanced' as const,
      };
    });

    return {
      mode: 'online_room',
      playerCount: (slots.length >= 2 ? slots.length : 2) as 2 | 3 | 4,
      theme,
      slots,
    };
  }

  public cleanup(): void {
    for (const conn of this.connections.values()) {
      conn.close();
    }
    this.connections.clear();

    if (this.hostConnection) {
      this.hostConnection.close();
      this.hostConnection = null;
    }

    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }

    this.role = 'standalone';
    this.roomCode = null;
  }
}
