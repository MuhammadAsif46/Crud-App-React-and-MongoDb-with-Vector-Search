import { MongoClient } from 'mongodb';
import OpenAI from 'openai';

const uri = "mongodb+srv://dbuser:dbpassword@cluster0.ovydsoh.mongodb.net/?retryWrites=true&w=majority";
export const client = new MongoClient(uri);


async function run() {
    try {
        await client.connect();
        console.log("Successfully connected to Atlas");
    } catch (err) {
        console.log(err.stack);
        await client.close();
        process.exit(1);
    }
}
run().catch(console.dir);

process.on("SIGINT", async function(){
    console.log("app is terminating");
    await client.close();
    process.exit(0);
});


export const openai = new OpenAI({
    apiKey: "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",
});