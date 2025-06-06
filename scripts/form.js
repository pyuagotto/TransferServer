//@ts-check
import { Player } from '@minecraft/server';
import { transferPlayer } from '@minecraft/server-admin';
import { ActionFormData, MessageFormData, ModalFormData } from '@minecraft/server-ui';
/**
 * 
 * @param {Player} player 
 */
const openAddServerMenu = function(player){
    const modalForm = new ModalFormData();
    modalForm.title("サーバーを登録");
    modalForm.textField("\nIP", "");
    modalForm.textField("Port", "0 ~ 65535");
    modalForm.textField("Name", "任意");
    modalForm.toggle("Save", { defaultValue: false });
    modalForm.submitButton("Go!");
    
    modalForm.show(player).then((data)=>{
        if(data.formValues){
            const ip = data.formValues[0];
            const port = data.formValues[1];
            const name = data.formValues[2];
            const save = data.formValues[3];

            if(!ip){
                player.sendMessage("§cIPアドレスを入力してください！！§r");
            }

            if(!port){
                player.sendMessage("§cPortを入力してください！！§r");
            }
            
            if(ip && port && typeof(port) === 'string'){
                if(save){
                    const info = {
                        ip: ip,
                        port: port,
                        name: name,
                    };

                    const serverListDp = player.getDynamicProperty("serverList");
                    let serverList;

                    if(!serverListDp){
                        serverList = [info];
                    }
                    
                    else if(typeof(serverListDp) === 'string'){
                        serverList = JSON.parse(serverListDp);
                        serverList.push(info);
                    }

                    player.setDynamicProperty(`serverList`, JSON.stringify(serverList));
                }

                transferPlayer(player, ip, parseInt(port));
            }
        }
    })
};

/**
 * 
 * @param {Player} player 
 */
const openDeleteServerMenu = function(player){
    const serverListDp = player.getDynamicProperty("serverList");
    const serverList = typeof(serverListDp) === 'string' && JSON.parse(serverListDp); 
    const serverCount = serverList.length ?? 0;

    const actionForm = new ActionFormData();
    actionForm.title("Server List");
    actionForm.body("§c削除するサーバーを選んでください");

    for(let i = 0; i < serverCount; i++){
        const server = serverList[i];

        if(server.name){
            actionForm.button(server.name);
        }else{
            actionForm.button(`${server.ip}:${server.port}`);
        }
            
    }

    actionForm.show(player).then((actionFormResponse)=>{
        if(actionFormResponse.selection != undefined){
            const selectedServer = actionFormResponse.selection;
            const serverListDp = player.getDynamicProperty(`serverList`);

            if(typeof(serverListDp) === 'string'){
                const serverList = JSON.parse(serverListDp);

                const info = serverList[selectedServer];
                let name = "";
                if(info.name){
                    name = info.name;
                }else{
                    name = info.ip + ":" + info.port;
                }
                
                openFinalCheckForm(player, name, serverList, selectedServer);
                
            }
        }
    });
};

/**
 * 
 * @param {Player} player 
 */
export const openActionForm = function(player){
    const serverListDp = player.getDynamicProperty("serverList");
    const serverList = typeof(serverListDp) === 'string' && JSON.parse(serverListDp); 
    const serverCount = serverList.length ?? 0;

    const actionForm = new ActionFormData();
    actionForm.title("Server List");

    for(let i = 0; i < serverCount; i++){
        const server = serverList[i];

        if(server.name){
            actionForm.button(server.name);
        }else{
            actionForm.button(`${server.ip}:${server.port}`);
        }
    }

    actionForm.button("§aAdd Server§r");
    actionForm.button("§cDelete Server§r");

    actionForm.show(player).then((data)=>{
        if(data.selection != undefined){
            switch(data.selection){
                case serverCount:
                    openAddServerMenu(player);
                    break;

                case serverCount + 1:
                    if(serverCount != 0){
                        openDeleteServerMenu(player);
                    }else{
                        player.sendMessage("§c登録されているサーバーがありません！！§r");
                    }
                    
                    break;

                default :
                    const server = serverList[data.selection];
                    const ip = server.ip;
                    const port = server.port;

                    transferPlayer(player, ip, parseInt(port));
            }
        }
    });
};

/**
 * 
 * @param {Player} player 
 * @param {String} name 
 * @param {any} serverList
 * @param {Number} selectedServer 
 */
const openFinalCheckForm = function(player, name, serverList, selectedServer){
    const messageForm = new MessageFormData();
    messageForm.title("最終確認");
    messageForm.body(`${name}\nを削除しますか？`);
    messageForm.button1("いいえ");
    messageForm.button2("はい");
    messageForm.show(player).then((messageFormResponse)=>{
        if(!messageFormResponse.canceled){
            switch(messageFormResponse.selection){
                case 0: 
                    player.sendMessage(`§6キャンセルしました§r`);
                    break;

                case 1: 
                    serverList.splice(selectedServer, 1);
                    
                    player.setDynamicProperty(`serverList`, JSON.stringify(serverList));
                    player.sendMessage(`${name}§cをサーバー一覧から削除しました§r`);
                    break;
            }
        }else{
            player.sendMessage(`§6キャンセルしました§r`);
        }
    });
};