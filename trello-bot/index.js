var Trello = require("trello");
const fs = require('fs-extra')
const Discord = require('discord.js');
const client = new Discord.Client();

var trello = new Trello("PUBLIC KEY", "SECRET KEY"); // Trello API
client.login('DISCORD_BOT_TOKEN'); // Discord BOT token

var discord_Channel = "ID" // Discord Channel ID
var trello_board = "ID" //ID BOARD

client.on('error', (_) => {
    console.log(_);
})

setInterval(() => {
    doCheck();
}, 10000);

function doCheck(){

    fs.readJson(__dirname+"/list.json", (err, listObject) => {
        if (err) console.error(err)

        trello.makeRequest('get', '/1/boards/'+trello_board+'/actions', { webhooks: true }).then((data) => {
            data = data.reverse();
            for (var card of data){
                //handleCard(card);
                if(card.data&&card.data.board){
                    fixBoard(card.data, function(board){
                        if(!listObject.includes(card.id)){
                            listObject.push(card.id)
                            console.log(card.type)
                            if(card.type == "updateCard"){
                                console.log(board)
                                if (board.old.desc != undefined) {
                                    let desc = ""
                                    if (board.card.desc.length < 1) {
                                        desc = 'пустое'
                                    } else {
                                        desc = board.card.desc
                                    }
                                    let embed = new Discord.RichEmbed()
                                    .setTitle(`${board.card.name}`)
                                    .setDescription(`Было изменено описание на ${desc}`)
                                    .setColor("#7799fb")
                                    .setTimestamp()
                                    .setFooter(`Trello`, 'https://i.pinimg.com/736x/03/96/40/039640617ae8c1a84d83fcd435f10360--ipa-free-download.jpg');
                                    client.channels.get(discord_Channel).send(embed)
                                }
                                if (board.old.name != undefined) {
                                    let embed = new Discord.RichEmbed()
                                    .setTitle(`${board.old.name}`)
                                    .setDescription(`Было изменено название ${board.card.name}`)
                                    .setColor("#7799fb")
                                    .setTimestamp()
                                    .setFooter(`Trello`, 'https://i.pinimg.com/736x/03/96/40/039640617ae8c1a84d83fcd435f10360--ipa-free-download.jpg');
                                    client.channels.get(discord_Channel).send(embed)
                                }
                                if(board.listAfter&&board.listBefore){
                                    let embed = new Discord.RichEmbed()
                                    .setTitle(`${board.card.name}`)
                                    .setDescription(`Был перемещен из ${board.listBefore.name} к ${board.listAfter.name}`)
                                    .setColor("#7799fb")
                                    .setTimestamp()
                                    .setFooter(`Trello`, 'https://i.pinimg.com/736x/03/96/40/039640617ae8c1a84d83fcd435f10360--ipa-free-download.jpg');
                                    client.channels.get(discord_Channel).send(embed)
                                }
                            } else if(card.type == "addMemberToCard"){
                                let embed = new Discord.RichEmbed()
                                .setTitle(`${board.card.name}`)
                                .setDescription(`${board.member.name} был добавлен к доске`)
                                .setColor("#7799fb")
                                .setTimestamp()
                                .setFooter(`Trello`, 'https://i.pinimg.com/736x/03/96/40/039640617ae8c1a84d83fcd435f10360--ipa-free-download.jpg');
                                client.channels.get(discord_Channel).send(embed)
                            } else if(card.type == "removeMemberFromCard"){
                                let embed = new Discord.RichEmbed()
                                .setTitle(`${board.card.name}`)
                                .setDescription(`${board.member.name} был удален из доски`)
                                .setColor("#7799fb")
                                .setTimestamp()
                                .setFooter(`Trello`, 'https://i.pinimg.com/736x/03/96/40/039640617ae8c1a84d83fcd435f10360--ipa-free-download.jpg');
                                client.channels.get(discord_Channel).send(embed)
                            } else if(card.type == "createCard"){
                                let embed = new Discord.RichEmbed()
                                .setTitle(`${board.card.name}`)
                                .setDescription(`Был создан в ${board.list.name}`)
                                .setColor("#7799fb")
                                .setTimestamp()
                                .setFooter(`Trello`, 'https://i.pinimg.com/736x/03/96/40/039640617ae8c1a84d83fcd435f10360--ipa-free-download.jpg');
                                client.channels.get(discord_Channel).send(embed)
                            }
                        }
                    })
                }
            }
            fs.writeJson(__dirname+"/list.json", listObject, err => {
                if (err) return console.error(err)
            })
        // console.log
        });
    });
}

function fixBoard(obj, cb){
    var fix = {};    
    for(var i in obj){
        fix[i] = obj[i]
    }
    cb(fix);
}


client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  doCheck();
});
