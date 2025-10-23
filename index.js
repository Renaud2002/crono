import { Client, Events, GatewayIntentBits, Partials } from "discord.js";
import "dotenv/config";
import { Client as pg_client } from 'pg'

const client = new Client({ 
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.DirectMessages,
		 GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent
	],
	partials: [Partials.Channel], 
});

client.on( Events.ClientReady, readyClient => { 
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);

const postgres = new pg_client({
	database: "articles",
});

async function insertArticle(link, date) {

	await postgres.connect();
	const text = 'INSERT INTO articles_td(link, date) VALUES($1, $2)';
	const values = [link, date];
	
	const res = await postgres.query(text, values);
	console.log(`res: ${res}`);
	await postgres.end();	

};

client.on( 'messageCreate',async  (message) => {
	if(message.author.bot) return;
	console.log(`article: ${message.content}`);
	await insertArticle(message.content, new Date());
});



// const postgres = new pg_client({
// 	database: "article_db",
// });
// await postgres.connect();
// console.log("connected to postgres go to bed!");
// await postgres.end();

// client.login(process.env.DISCORD_TOKEN);
