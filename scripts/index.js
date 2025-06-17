//@ts-check
import { CommandPermissionLevel, CustomCommandOrigin, CustomCommandParamType, CustomCommandStatus, Player, system, world } from '@minecraft/server';
import { transferPlayer } from '@minecraft/server-admin';
import { openActionForm } from './form.js';
import config from './config.js';

system.beforeEvents.startup.subscribe((ev) => {
    /**
     * 
     * @param {string} name 
     * @param {string} description 
     * @param {import("@minecraft/server").CustomCommandParameter[]} mandatoryParameters 
     * @param {(origin: CustomCommandOrigin, ...args: any[]) => { status: CustomCommandStatus, message?: string } | undefined} callback 
     */
    const registerCommand = function(name, description, mandatoryParameters, callback) {
        ev.customCommandRegistry.registerCommand(
            {
                name,
                description,
                mandatoryParameters,
                permissionLevel: CommandPermissionLevel.GameDirectors,
            },
            callback
        );
    };


    registerCommand(
        "pyuagotto:transfer",
        "サーバーに転送します",
        [
            { name: "ip", type: CustomCommandParamType.String },
            { name: "port", type: CustomCommandParamType.Integer },
        ],
        transfer
    );
});

/**
 * 
 * @param {CustomCommandOrigin} origin 
 * @param {string} ip
 * @param {number} port
 */
const transfer = function(origin, ip, port){
    const player = origin.sourceEntity;
    if(player instanceof Player){
        system.run(()=>{
            transferPlayer(player, { hostname: ip, port: port });
        });
        
        return { status: CustomCommandStatus.Success };
    }

    return { status: CustomCommandStatus.Failure, message: "このコマンドはプレイヤー以外に対して実行できません" };
}

world.afterEvents.itemUse.subscribe((ev)=>{
    const { itemStack, source } = ev;

    if(itemStack.typeId === config.itemId){
        openActionForm(source);
    }
});