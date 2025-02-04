import { Client, Events, GatewayIntentBits, REST, Routes } from 'discord.js'
import dotenv from 'dotenv'
import { Configuration, OpenAIApi } from 'openai'

dotenv.config()

const token = process.env.DISCORD_TOKEN
const guildID = '700089396216725625'
const clientID = '1307964083575980073'
const openaiApiKey = process.env.OPENAI_API_KEY

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.MessageContent,
	],
})

const commands = [
	{
		name: 'ping',
		description: 'Replies with Pong!',
	},
	{
		name: 'haiku',
		description: 'Generates a haiku about AI.',
	},
]

const rest = new REST({ version: '10' }).setToken(token)

const configuration = new Configuration({
	apiKey: openaiApiKey,
})
const openai = new OpenAIApi(configuration)

;(async () => {
	try {
		console.log('Started refreshing application (/) commands.')

		await rest.put(Routes.applicationGuildCommands(clientID, guildID), {
			body: commands,
		})

		console.log('Successfully reloaded application (/) commands.')
	} catch (error) {
		console.error('Error while registering commands:', error)
	}
})()

client.on(Events.ClientReady, readyClient => {
	console.log(`Logged in as ${readyClient.user.tag}!`)
})

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return

	if (interaction.commandName === 'ping') {
		await interaction.reply('Pong!')
		console.log('Replied to /ping')
	}

	if (interaction.commandName === 'haiku') {
		try {
			const response = await openai.createChatCompletion({
				model: 'gpt-4',
				messages: [{ role: 'user', content: 'Write a haiku about AI.' }],
			})

			const haiku = response.data.choices[0].message.content
			await interaction.reply(haiku) // Ответ пользователю
			console.log('Replied to /haiku with AI-generated haiku')
		} catch (error) {
			console.error(
				'Error fetching response from OpenAI:',
				error.response?.data || error.message
			)
			await interaction.reply('Sorry, I could not generate a haiku right now.')
		}
	}
})

if (!token || !openaiApiKey) {
	console.error('Error: Missing DISCORD_TOKEN or OPENAI_API_KEY in .env file')
	process.exit(1)
}

client.login(token)
