import 'dotenv/config'
import { Mistral } from '@mistralai/mistralai'

const client = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY
})

async function test() {
  const res = await client.chat.complete({
    model: "mistral-small-latest",
    messages: [
      { role: "user", content: "Say hello" }
    ]
  })

  console.log(res.choices[0].message.content)
}

test()
