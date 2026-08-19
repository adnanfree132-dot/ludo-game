import { GameState, MatchConfig, PlayerColor } from '../engine/Types';

export type MessageType =
  | 'JOIN_REQUEST'
  | 'JOIN_ACCEPT'
  | 'JOIN_REJECT'
  | 'ROOM_UPDATE'
  | 'PLAYER_READY'
  | 'START_GAME'
  | 'SYNC_STATE'
  | 'CLIENT_ROLL_DICE'
  | 'CLIENT_MOVE_TOKEN'
  | 'SEND_EMOTE'
  | 'HEARTBEAT'
  | 'BOT_TAKEOVER';

export interface BaseMessage {
  type: MessageType;
  senderId: string;
  timestamp: number;
}

export interface JoinRequestMessage extends BaseMessage {
  type: 'JOIN_REQUEST';
  playerName: string;
  preferredColor?: PlayerColor;
}

export interface RoomSlotInfo {
  peerId: string;
  playerIndex: number;
  name: string;
  color: PlayerColor;
  isHost: boolean;
  isReady: boolean;
  isBot: boolean;
}

export interface JoinAcceptMessage extends BaseMessage {
  type: 'JOIN_ACCEPT';
  assignedPlayerIndex: number;
  roomCode: string;
  slots: RoomSlotInfo[];
  state?: GameState;
}

export interface JoinRejectMessage extends BaseMessage {
  type: 'JOIN_REJECT';
  reason: string;
}

export interface RoomUpdateMessage extends BaseMessage {
  type: 'ROOM_UPDATE';
  roomCode: string;
  slots: RoomSlotInfo[];
  canStart: boolean;
}

export interface PlayerReadyMessage extends BaseMessage {
  type: 'PLAYER_READY';
  playerIndex: number;
  isReady: boolean;
}

export interface StartGameMessage extends BaseMessage {
  type: 'START_GAME';
  config: MatchConfig;
  initialState: GameState;
}

export interface SyncStateMessage extends BaseMessage {
  type: 'SYNC_STATE';
  state: GameState;
}

export interface ClientRollDiceMessage extends BaseMessage {
  type: 'CLIENT_ROLL_DICE';
  playerIndex: number;
}

export interface ClientMoveTokenMessage extends BaseMessage {
  type: 'CLIENT_MOVE_TOKEN';
  playerIndex: number;
  tokenId: string;
}

export interface SendEmoteMessage extends BaseMessage {
  type: 'SEND_EMOTE';
  playerIndex: number;
  emoji: string;
  label?: string;
}

export interface HeartbeatMessage extends BaseMessage {
  type: 'HEARTBEAT';
  playerIndex: number;
}

export interface BotTakeoverMessage extends BaseMessage {
  type: 'BOT_TAKEOVER';
  playerIndex: number;
  reason: 'timeout' | 'disconnect';
}

export type NetworkMessage =
  | JoinRequestMessage
  | JoinAcceptMessage
  | JoinRejectMessage
  | RoomUpdateMessage
  | PlayerReadyMessage
  | StartGameMessage
  | SyncStateMessage
  | ClientRollDiceMessage
  | ClientMoveTokenMessage
  | SendEmoteMessage
  | HeartbeatMessage
  | BotTakeoverMessage;
