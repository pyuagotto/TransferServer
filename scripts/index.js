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
     * @param {import("@minecraft/server").CustomCommandParameter[]} optionalParameters 
     * @param {(origin: CustomCommandOrigin, ...args: any[]) => { status: CustomCommandStatus, message?: string } | undefined} callback 
     */
    const registerCommand = function(name, description, mandatoryParameters, optionalParameters, callback) {
        ev.customCommandRegistry.registerCommand(
            {
                name,
                description,
                mandatoryParameters,
                optionalParameters,
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
        ],
        [
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
    if(origin.sourceEntity instanceof Player){
        system.run(()=>{
            transferPlayer(origin.sourceEntity, ip, port);
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