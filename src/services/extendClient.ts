import { Client } from "discord.js";
import { deployCommands } from "./deployCommands.js";
import { loadSlashCommands, loadTextCommands } from "./loadCommands.js";
import { loadEvents } from "./loadEvents.js";

Client.prototype.textCommands = new Map();
Client.prototype.slashCommands = new Map();

Client.prototype.loadTextCommands = loadTextCommands;
Client.prototype.loadSlashCommands = loadSlashCommands;
Client.prototype.loadEvents = loadEvents;
Client.prototype.deployCommands = deployCommands;
