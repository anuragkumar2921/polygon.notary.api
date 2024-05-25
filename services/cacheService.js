const redis = require('redis')
const config = require('../configs/redisConfig')
const {promisify} = require('util');
const {port} = require('../configs/redisConfig');
const client = redis.createClient({
  host: config.host,
  port: config.port,
  password: config.password
})
client.on('connect', function () {
  console.log(`Successfully Connected to redis with host: ${config.host} and port: ${port}`);
});

const setAsyncEx = promisify(client.setex).bind(client)
const getAsync = promisify(client.get).bind(client)
const delAsync = promisify(client.del).bind(client)

client.on('error', err => {
  console.log('Error in redis cache' + err);
});

const saveWithTtl = async (key, value, ttlSeconds = 120) => {
  return await setAsyncEx(key, ttlSeconds, value);
}

const get = async (key) => {
  return await getAsync(key);
}

const remove = async (key) => {
  await delAsync(key)
}

module.exports = {
  saveWithTtl,
  get,
  remove
}