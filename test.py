import discord
import asyncio
 
client = discord.Client()
 
@client.event
async def on_ready():
    print('Logged in as')
    print(client.user.name)
    print(client.user.id)
    print('------')
 
@client.event
async def on_message(message):
    if message.content.startswith('!test'):
        await message.channel.send('test!!!!')
 
    elif message.content.startswith('!say'):
        await message.channel.send('leave message')
        msg = await client.wait_for('reaction_add',timeout=15.0)
 
        if msg is None:
            await message.channel.send('15초내로 입력해주세요. 다시시도: !say')
            return
        else:
            await message.channel.send(msg.content)
 
client.run('Njg0NTgwNzkyMjQ0MTA5MzMy.Xl8Pig.GJzQAtM2WCujbmFd0z9utvDVOow')