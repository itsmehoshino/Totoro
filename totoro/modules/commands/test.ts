const meta = {
  name: "test",
  aliases: ["t"],
  category: "test",
  description: "test command",
  developer: "Francis Loyd Raval",
  usage: "test"
},
export async function execute({ response }){
  response.reply("test");
}

export default { meta, execute }