"use strict";

import { Client, Events, GatewayIntentBits, Partials } from "discord.js";
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
	const text = 'SELECT * FROM articles_td WHERE date <= (NOW() - INTERVAL \'2 weeks\')::date AND date >  (NOW() - INTERVAL \'5 weeks\')::date;';
	const res = await postgres.query(text);

	let articles = [];
	for (let i = 0; i<res["rows"].length; i++) {
		articles.push(res["rows"][i]["link"]);
	}

	// const article = res["rows"][0]["link"];
	console.log(`results object: ${JSON.stringify(res, null, 2)}`);
	console.log(`artilces: ${JSON.stringify(article, null, 2)}`);
	sendNotification(article);
}

async function sendNotification (articles) {

	for (let i=0; i<articles.length; i++) {
		fetch('https://ntfy.sh/crono', {
			method: 'POST', 
			body: 'yo read this article already foo!',
			headers: {
				'Click': articles[i],
				'Attach': articles[i]
			},
		})
	}
	
}


client.on( 'messageCreate',async  (message) => {
	if(message.author.bot) return;
	console.log(`article: ${message.content}`);
	await insertArticle(message.content, new Date());
});

// cron job that runs every day at 6:30 pm
cron.schedule("30 18 * * *", () => {
	findExpireArticles();
});


