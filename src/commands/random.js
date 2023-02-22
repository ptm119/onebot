const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("random")
        .setDescription("GMD 한국 포럼의 맵을 무작위로 선정합니다")
        .addStringOption((option) =>
            option
                .setName("범위")
                .setDescription("맵 선정 범위를 설정합니다")
                .setRequired(true)
                .setChoices(
                    { name: "All Level", value: "all-level" },
                    { name: "Main ~ Extended", value: "main-extended" },
                    { name: "Main", value: "main" },
                    { name: "Extended", value: "extended" },
                    { name: "Legacy", value: "legacy" },
                )
        ),
    async execute(interaction) {
        await interaction.deferReply();
        const range = interaction.options.getString("범위");
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
                                            `by ${mapData.publisher.nickname}${mapData.creators.length > 1 ? " and more" : ""}${mapData.creators.length > 1 && mapData.publisher.nickname === mapData.verifier.nickname ? "" : `, Verified by ${mapData.verifier.nickname}`}\n\n**순위**\n\nGMD 한국포럼 순위: ${mapData.level_rank}위\n${mapData.pointercrate_rank === null ? "" : `(pointercrate 순위: ${mapData.pointercrate_rank}위)\n`}\n\n**레벨 정보**\n\n레벨 id: ${mapData.ingame_level_id}${mapData.ingame_password === null || mapData.ingame_password === 1 ? "" : `\n레벨 비밀번호: ${String(mapData.ingame_password).padStart(6, "0")}`}\n레벨 길이: ${parseInt(mapData.ingame_length / 60)}:${String(mapData.ingame_length % 60).padStart(2, "0")} (${mapLength})${mapData.ingame_objects === null ? "" : `\n오브젝트 수: ${mapData.ingame_objects}`}${mapData.rate_point === 0 ? "" : `\n평점: ${Math.round(mapData.rate_point / mapData.rate_users * 10) / 10}★`}`
                                        )
                                        .setThumbnail(`https://gdbrowser.com/assets/difficulties/${difficulty}.png`)
                                        .setColor(rankColor)

                                    const row = new ActionRowBuilder()
                                        .addComponents(
                                            new ButtonBuilder()
                                                .setCustomId(`random retry ${range}`)
                                                .setLabel("다시 뽑기")
                                                .setStyle(ButtonStyle.Primary),
                                            new ButtonBuilder()
                                                .setCustomId(`random video ${mapData.video_url} ${range}`)
                                                .setLabel("레벨 동영상")
                                                .setStyle(ButtonStyle.Secondary)
                                        );

                                    await interaction.editReply({ embeds: [embed], components: [row] });
                                } catch (error) {
                                    console.error(error);
                                    await interaction.editReply("에러 발생!");
                                }
                            }))
                }));
    }
}