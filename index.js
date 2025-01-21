import dotenv from 'dotenv'
dotenv.config()

import {
	ButtonBuilder,
	ButtonStyle,
	Client,
	GatewayIntentBits,
} from 'discord.js'

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.MessageContent,
	],
})

const btn = new ButtonBuilder()
	.setCustomId('hiMom')
	.setLabel('Say Hi to my Mom?')
	.setStyle(ButtonStyle.Primary)

client.on('messageCreate', async message => {
	console.log(message)

	if (!message.author.bot) {
		try {
			await message.channel.send({
				content: 'Push my buttons!',
				components: [
					{
						type: 1,
						components: [btn],
					},
				],
			})
		} catch (error) {
			console.error('Error sending message:', error)
		}
	}
})

client.on('interactionCreate', async interaction => {
	if (interaction.customId === 'hiMom') {
		await interaction.reply({
			content: 'Mom says hi back',
			ephemeral: true,
		})
	}
})
