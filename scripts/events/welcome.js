const { getTime, drive } = global.utils;
if (!global.temp.welcomeEvent)
	global.temp.welcomeEvent = {};

module.exports = {
	config: {
		name: "welcome",
		version: "1.7",
		author: "NTKhang",
		category: "events"
	},

	langs: {
		vi: {
			session1: "sáng",
			session2: "trưa",
			session3: "chiều",
			session4: "tối",
			welcomeMessage: "Cảm ơn bạn đã mời tôi vào nhóm!\nPrefix bot: %1\nĐể xem danh sách lệnh hãy nhập: %1help",
			multiple1: "bạn",
			multiple2: "các bạn",
			defaultWelcomeMessage: "Xin chào {userName}.\nChào mừng bạn đến với {boxName}.\nChúc bạn có buổi {session} vui vẻ!"
		},
		en: {
			session1: "𝙼𝚘𝚛𝚗𝚒𝚗𝚐",
			session2: "𝙽𝚘𝚘𝚗",
			session3: "𝙰𝚏𝚝𝚎𝚛𝚗𝚘𝚘𝚗",
			session4: "𝙴𝚟𝚎𝚗𝚒𝚗𝚐",
			welcomeMessage: "⭕🔰𝑨𝒔𝒔𝒂𝒍𝒂𝒎𝒖-𝒂𝒍𝒂𝒊𝒌𝒖𝒎🔰⭕\n\n🔰𝑻𝒉𝒂𝒏𝒌 𝒀𝒐𝒖 𝑭𝒐𝒓 𝑰𝒏𝒗𝒊𝒕𝒊𝒏𝒈 𝑴𝒆 𝒕𝒐 𝑻𝒉𝒆 𝑮𝒓𝒐𝒖𝒑...!\n🔰𝑩𝒐𝒕 𝑷𝒓𝒆𝒇𝒊𝒙 : !\n🔰𝑻𝒐 𝒗𝒊𝒆𝒘 𝑻𝒉𝒆 𝑳𝒊𝒔𝒕 𝑶𝒇 𝑪𝒎𝒅,𝑷𝒍𝒆𝒂𝒔𝒆 : /𝑯𝒆𝒍𝒑\n⚠️𝑰 𝑯𝒐𝒍𝒆 𝒀𝒐𝒖 𝑾𝒊𝒍𝒍 𝑭𝒐𝒍𝒍𝒐𝒘 𝑶𝒖𝒓 𝑮𝒓𝒐𝒖𝒑 𝑹𝒖𝒍𝒆𝒔☢️",
			multiple1: "𝚈𝚘𝚞",
			multiple2: "𝚈𝚘𝚞 𝙶𝚞𝚈𝚜",
			defaultWelcomeMessage: `🔵𝙰𝚜𝚜𝚊𝚕𝚊𝚖𝚞-𝚊𝚕𝚊𝚔𝚞𝚖🔴\n🔰𝙷𝚎𝚕𝚕𝚘𝚠 {userName}.\n🔰𝚆𝚎𝚕𝚌𝚘𝚖𝚎 {multiple} 𝚃𝚘 𝙾𝚞𝚛 𝙶𝚛𝚘𝚞𝚙__: {boxName}\n🔰𝙷𝚊𝚟𝚎 𝚊 𝙽𝚒𝚌𝚎 {session} \n\n⚠️𝙸 𝙷𝚘𝚕𝚎 𝚈𝚘𝚞 𝚆𝚒𝚕𝚕 𝙵𝚘𝚕𝚕𝚘𝚠 𝙾𝚞𝚛 𝙶𝚛𝚘𝚞𝚙 𝚁𝚞𝚕𝚎𝚜☢️\n\n⚫𝚆𝚎 𝚆𝚒𝚜𝚑 𝚈𝚘𝚞 𝙰𝚕𝚕 𝚃𝚑𝚎 𝙱𝚎𝚜𝚝 𝙵𝚘𝚛 𝙲𝚘𝚖𝚖𝚒𝚗𝚐 𝙾𝚞𝚛 𝙶𝚛𝚘𝚞𝚙❤️‍🩹🫶`
		}
	},

	onStart: async ({ threadsData, message, event, api, getLang }) => {
		if (event.logMessageType == "log:subscribe")
			return async function () {
				const hours = getTime("HH");
				const { threadID } = event;
				const { nickNameBot } = global.GoatBot.config;
				const prefix = global.utils.getPrefix(threadID);
				const dataAddedParticipants = event.logMessageData.addedParticipants;
				// if new member is bot
				if (dataAddedParticipants.some((item) => item.userFbId == api.getCurrentUserID())) {
					if (nickNameBot)
						api.changeNickname(nickNameBot, threadID, api.getCurrentUserID());
					return message.send(getLang("welcomeMessage", prefix));
				}
				// if new member:
				if (!global.temp.welcomeEvent[threadID])
					global.temp.welcomeEvent[threadID] = {
						joinTimeout: null,
						dataAddedParticipants: []
					};

				// push new member to array
				global.temp.welcomeEvent[threadID].dataAddedParticipants.push(...dataAddedParticipants);
				// if timeout is set, clear it
				clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);

				// set new timeout
				global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async function () {
					const threadData = await threadsData.get(threadID);
					if (threadData.settings.sendWelcomeMessage == false)
						return;
					const dataAddedParticipants = global.temp.welcomeEvent[threadID].dataAddedParticipants;
					const dataBanned = threadData.data.banned_ban || [];
					const threadName = threadData.threadName;
					const userName = [],
						mentions = [];
					let multiple = false;

					if (dataAddedParticipants.length > 1)
						multiple = true;

					for (const user of dataAddedParticipants) {
						if (dataBanned.some((item) => item.id == user.userFbId))
							continue;
						userName.push(user.fullName);
						mentions.push({
							tag: user.fullName,
							id: user.userFbId
						});
					}
					// {userName}:   name of new member
					// {multiple}:
					// {boxName}:    name of group
					// {threadName}: name of group
					// {session}:    session of day
					if (userName.length == 0) return;
					let { welcomeMessage = getLang("defaultWelcomeMessage") } =
						threadData.data;
					const form = {
						mentions: welcomeMessage.match(/\{userNameTag\}/g) ? mentions : null
					};
					welcomeMessage = welcomeMessage
						.replace(/\{userName\}|\{userNameTag\}/g, userName.join(", "))
						.replace(/\{boxName\}|\{threadName\}/g, threadName)
						.replace(
							/\{multiple\}/g,
							multiple ? getLang("multiple2") : getLang("multiple1")
						)
						.replace(
							/\{session\}/g,
							hours <= 10
								? getLang("session1")
								: hours <= 12
									? getLang("session2")
									: hours <= 18
										? getLang("session3")
										: getLang("session4")
						);

					form.body = welcomeMessage;

					if (threadData.data.welcomeAttachment) {
						const files = threadData.data.welcomeAttachment;
						const attachments = files.reduce((acc, file) => {
							acc.push(drive.getFile(file, "stream"));
							return acc;
						}, []);
						form.attachment = (await Promise.allSettled(attachments))
							.filter(({ status }) => status == "fulfilled")
							.map(({ value }) => value);
					}
					message.send(form);
					delete global.temp.welcomeEvent[threadID];
				}, 1500);
			};
	}
};
