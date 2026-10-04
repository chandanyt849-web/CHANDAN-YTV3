export interface Message {
  id: string;
  sender: 'chandan' | 'maya';
  text: string;
  audioBase64?: string | null;
  timestamp: string;
  toolActions?: ToolAction[];
  type?: 'text' | 'voice';
}

export interface ToolAction {
  tool: string;
  args: Record<string, any>;
  timestamp: string;
}

export interface Reminder {
  id: string;
  title: string;
  time: string;
  category: 'Work' | 'Personal' | 'Health' | 'Learning' | 'Urgent' | 'Routine';
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  createdAt: string;
}

export interface TimerItem {
  id: string;
  label: string;
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  isAlarm?: boolean;
  alarmTime?: string;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  tag: string;
  createdAt: string;
}

export interface DeviceSettings {
  flashlight: boolean;
  silentMode: boolean;
  batterySaver: boolean;
  doNotDisturb: boolean;
  brightness: number; // 0 to 100
  volume: number; // 0 to 100
  batteryLevel: number;
}

export interface WeatherInfo {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  forecast: Array<{ day: string; temp: number; icon: string }>;
}
