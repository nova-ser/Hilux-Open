const {
    cmd,
    isPublic
} = require("../lib/plugins.js");
const fetch = require('node-fetch')
const axios = require('axios');
const {
    AddMp3Meta
} = require("../lib/functions.js");

cmd({
    on: "text",
    fromMe: isPublic,
},
    async({
        m, client, args
    })=> {

        if (!m.quoted) return;
        try {
            if (client.user.id.split(':')[0] === m.quoted.sender.split('@')[0] && !parseInt(m.text)) {}
        } catch (e) {
            console.log(e)
        }
    })

cmd({
    on: "text",
    fromMe: isPublic,
},
    async({
        m, client, args
    })=> {

        if (!m.quoted) return;
        try {
            if (client.user.id.split(':')[0] === m.quoted.sender.split('@')[0] && parseInt(m.text)) {
                const number = parseInt(m.text);

                if (number >= 1 && number <= 11) {

                    if (m.quoted.text.includes("Youtube Downloader")) {
                        const lines = m.quoted.text.split('\n');
                        const query = lines[number+1].split(' .')[1].trim();
                        let mes = await client.sendMessage(m.jid, {
                            text: `_Searching..._`
                        }, {
                            quoted: m
                        })
                        const res = await axios.get(`https://api-viper.onrender.com/api/song?name=${query}`)
                        let response = await res.data
                        await client.sendMessage(m.jid, {
                            text: `_Select Type_\n\n_Title: ${response.data.title}_\n_Url: ${response.data.url}_\n\n_1 .Audio_\n_2 .Video_\n\n_Reply with Number_`, edit: mes.key
                        }, {
                            quoted: m
                        })
                    }
                    if (m.quoted.text.includes("Select Type")) {
                        const lines = m.quoted.text.split('\n');
                        const selectedPart = lines[number + 4];
                        const query = selectedPart.trim().replace(/^\d+\s*\./, '');
                        const urlRegex = /Url: (https?:\/\/[^\s]+)/;
                        const match = m.quoted.text.match(urlRegex);
                        const url = match && match[1];
                        let mes = await client.sendMessage(m.jid, {
                            text: `_Downloading..._`
                        }, {
                            quoted: m
                        })
                        const res = await axios.get(`https://api-viper.onrender.com/api/song?name=${url}`)
                        let response = await res.data
                        if (query.includes("Audio")) {
                            let coverBuffer = await (await fetch(`${response.data.thumbnail}`)).buffer()
                            let songbuff = await (await fetch(`${response.data.downloadUrl}`)).buffer()
                            await client.sendMessage(m.jid, {
                                text: `_Downloading : ${response.data.title}_`, edit: mes.key
                            }, {
                                quoted: m
                            })
                            const song = await AddMp3Meta(songbuff, coverBuffer, {
                                title: response.data.title, artist: response.data.channel.name
                            })
                            return client.sendMessage(m.jid, {
                                audio: song, mimetype: 'audio/mpeg'
                            }, {
                                quoted: m
                            })
                        }
                        if (query.includes("Video")) {
                            let vidbuff = await (await fetch(`https://api-viper.onrender.com/api/ytdl?video360p=${response.data.url}`)).buffer()
                            m.sendMsg(m.jid, vidbuff, {}, "video")
                        }
                    }

                } else {
                    return;
                }}
        } catch {}

    })
