import {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    Events,
} from "discord.js";

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton()) return;
        const customId = interaction.customId;
        const commandName = customId.split(" ")[0];
        if (commandName === "random") {
            if (customId.split(" ")[1] === "retry") {
                const range = customId.split(" ")[2];
                await interaction.deferReply();
                let page = "";
                let count = "";
                if (range === "all-level" || range === "legacy") {
                    page = 1;
                    count = 1000;
                } else if (range === "main") {
                    page = 1;
                    count = 75;
                } else if (range === "extended") {
                    page = 2;
                    count = 75;
                } else if (range === "main-extended") {
                    page = 1;
                    count = 150;
                }
                const url = `https://gmdkoreaforum.com/api/demonlist/levels?page=${page}&count=${count}`;
                fetch(url)
                    .then((res) => res.json()
                        .then((resData) => {
                            let mapDatas = resData.data;
                            if (range === "legacy") {
                                mapDatas = mapDatas.slice(150);
                            }
                            const mapId = mapDatas[Math.floor(Math.random() * mapDatas.length)].level_id;
                            fetch(`https://gmdkoreaforum.com/api/demonlist/levels/${mapId}?find_by=id`)
                                .then((res) => res.json()
                                    .then(async (resData) => {
                                        try {
                                            const mapData = resData.data;
                                            let mapLength = "";
                                            if (mapData.ingame_length < 10) {
                                                mapLength = "Tiny";
                                            } else if (mapData.ingame_length < 30) {
                                                mapLength = "Short";
                                            } else if (mapData.ingame_length < 60) {
                                                mapLength = "Medium"
                                            } else if (mapData.ingame_length < 120) {
                                                mapLength = "Long";
                                            } else {
                                                mapLength = "XL";
                                            }
                                            const rank = mapData.level_rank;
                                            let rankColor = "";
                                            if (rank <= 75) {
                                                rankColor = "#EF5350";
                                            } else if (rank > 75 && rank <= 150) {
                                                rankColor = "#00BCD4";
                                            } else {
                                                rankColor = "#4CAF50";
                                            }
                                            let difficulty = mapData.ingame_difficulty;
                                            if (difficulty === 6) {
                                                difficulty = "demon-extreme-featured";
                                            } else if (difficulty === 5) {
                                                difficulty = "demon-insane-featured";
                                            } else {
                                                difficulty = "unrated";
                                            }
                                            const embed = new EmbedBuilder()
                                                .setTitle(mapData.level_name)
                                                .setDescription(
                                                    `by ${mapData.publisher.nickname}${mapData.creators.length > 1 ? " and more" : ""}${mapData.creators.length > 1 && mapData.publisher.nickname === mapData.verifier.nickname ? "" : `, Verified by ${mapData.verifier.nickname}`}\n\n**??????**\n\nGMD ???????????? ??????: ${mapData.level_rank}???\n${mapData.pointercrate_rank === null ? "" : `(pointercrate ??????: ${mapData.pointercrate_rank}???)\n`}\n\n**?????? ??????**\n\n?????? id: ${mapData.ingame_level_id}${mapData.ingame_password === null || mapData.ingame_password === 1 ? "" : `\n?????? ????????????: ${String(mapData.ingame_password).padStart(6, "0")}`}\n?????? ??????: ${parseInt(mapData.ingame_length / 60)}:${String(mapData.ingame_length % 60).padStart(2, "0")} (${mapLength})${mapData.ingame_objects === null ? "" : `\n???????????? ???: ${mapData.ingame_objects}`}${mapData.rate_point === 0 ? "" : `\n??????: ${Math.round(mapData.rate_point / mapData.rate_users * 10) / 10}???`}`
                                                )
                                                .setThumbnail(`https://gdbrowser.com/assets/difficulties/${difficulty}.png`)
                                                .setColor(rankColor)

                                            const row = new ActionRowBuilder()
                                                .addComponents(
                                                    new ButtonBuilder()
                                                        .setCustomId(`random retry ${range}`)
                                                        .setLabel("?????? ??????")
                                                        .setStyle(ButtonStyle.Primary),
                                                    new ButtonBuilder()
                                                        .setCustomId(`random video ${mapData.video_url} ${range}`)
                                                        .setLabel("?????? ?????????")
                                                        .setStyle(ButtonStyle.Secondary)
                                                );

                                            await interaction.deleteReply();
                                            await interaction.channel.send({ embeds: [embed], components: [row] });
                                        } catch (error) {
                                            console.error(error);
                                            await interaction.editReply("?????? ??????!");
                                        }
                                    }))
                        }));
            } else if (customId.split(" ")[1] === "video") {
                try {
                    const video_url = customId.split(" ")[2];
                    const range = customId.split(" ")[3];

                    const row = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`random retry ${range}`)
                                .setLabel("?????? ??????")
                                .setStyle(ButtonStyle.Primary),
                        );

                    await interaction.reply({ content: `${video_url}`, components: [row] });
                } catch (error) {
                    console.error(error);
                    await interaction.editReply("?????? ??????!");
                }
            }
        }
    }
}