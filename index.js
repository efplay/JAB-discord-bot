import {
	Client,
	GatewayIntentBits,
	REST,
	Routes,
	SlashCommandBuilder,
} from 'discord.js'
import 'dotenv/config'
import { OpenAI } from 'openai'

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
})

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
	apiBase: 'https://api.openai.com/v1',
})

const commands = [
	new SlashCommandBuilder()
		.setName('ask')
		.setDescription('Sends a request to ChatGPT')
		.addStringOption(option =>
			option
				.setName('question')
				.setDescription('Your question')
				.setRequired(true)
		),
].map(command => command.toJSON())

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN)

client.once('ready', async () => {
	console.log(`✅ Bot is running as ${client.user.tag}`)

	try {
		await rest.put(Routes.applicationCommands(client.user.id), {
			body: commands,
		})
		console.log('✅ Commands have been registered!')
	} catch (error) {
		console.error('Error registering commands:', error)
	}
})

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return

	if (interaction.commandName === 'ask') {
		await interaction.deferReply()
		const question = interaction.options.getString('question')

		try {
			const completion = await openai.chat.completions.create({
				model: 'gpt-3.5-turbo',
				messages: [
					{ role: 'developer', content: 'You are a helpful assistant.' },
					{
						role: 'user',
						content: 'Write a haiku about recursion in programming.',
					},
				],
				store: true,
			})

			await interaction.editReply(completion.choices[0].message.content)
			console.log(response.data.choices)
		} catch (error) {
			console.error('Error with OpenAI:', error)
			await interaction.editReply('Error processing the request with OpenAI.')
		}
	}
})

client.login(process.env.DISCORD_TOKEN)
