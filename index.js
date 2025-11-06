import { ActionRow, Client, Events, GatewayIntentBits, Partials } from "discord.js";
import "dotenv/config";
import { Client as pg_client } from 'pg'
import cron from 'node-cron'

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

async function insertArticle(link, date) {

	const postgres = new pg_client({
		database: "articles",
	});

	await postgres.connect();
	const text = 'INSERT INTO articles_td(link, date) VALUES($1, $2)';
	const values = [link, date];
	
	const res = await postgres.query(text, values);
	console.log(`res: ${res}`);
	await postgres.end();	

};

async function findExpireArticles() {

	const postgres = new pg_client({
		database: "articles",
	});
	
	await postgres.connect();
	const text = 'SELECT * FROM articles_td WHERE date <= (NOW() - INTERVAL \'2 weeks\')::date;';
	const res = await postgres.query(text);
	const article = res["rows"][0]["link"];
	console.log(JSON.stringify(res, null, 2));
	console.log(article)
	sendNotification(article);
}

async function sendNotification (article) {
	fetch('https://ntfy.sh/crono', {
		method: 'POST', 
		body: 'yo read this article already foo!',
		headers: {
			'Click': article,
    	},
	})
}


client.on( 'messageCreate',async  (message) => {
	if(message.author.bot) return;
	console.log(`article: ${message.content}`);
	await insertArticle(message.content, new Date());
});

cron.schedule("30 3 * * *", () => {
	findExpireArticles();
});


