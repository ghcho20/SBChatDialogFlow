const dlgflo = require('./server')

const usession = new Map()
exports.userSession = usession

const BOTID = 'botStaff'

/**
 * Sendbird Webhook Handler
 *  - group_channel:join
 *  - group_channel:leave
 */
function webhookPost(req, res) {
    res.sendStatus(200)

    const {category, channel, joined_at, left_at, users} = req.body

    switch(category) {
        case 'group_channel:join':
            for (let user of users) {
                console.log(`webhook cat: ${category}, chann: ${channel.channel_url}, joined at ${joined_at}`)
                if (BOTID === user.user_id) {
                    usession.set(channel.channel_url, {
                        sessionId: joined_at,
                        botId: user.user_id,
                        channelUrl: channel.channel_url,
                        todos: [],
                        timerObj: null
                    })
                    dlgflo.sendEvent(usession.get(channel.channel_url), 'welcome', {})
                }
            }
            break

        case 'group_channel:leave':
            for (let user of users) {
                console.log(`webhook cat: ${category}, chann: ${channel.channel_url}, left at ${left_at}`)
                if (BOTID === user.user_id) {
                    let session = usession.get(channel.channel_url)
                    if (session !== undefined) {
                        clearTimeout(session.timerObj)
                        usession.delete(channel.channel_url)
                    }
                }
            }
            break

        default:
            console.log(`WARNING: not expected category: ${category}`)
    }
}
exports.sbWebhookPost = webhookPost