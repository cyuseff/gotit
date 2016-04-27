local json
local ttl
local keys = redis.call("SMEMBERS", KEYS[1])
if table.getn(keys) == 0 then return keys end
for i, k in ipairs(keys) do
  ttl = redis.call("TTL", k)
  if ttl<0 then
    if ttl == -2 then
      redis.call("SREM", KEYS[1], k)
    else
      json = cjson.decode(redis.call("GET", k))
      json.data = cjson.decode(ARGV[1])
      redis.call("SET", k, cjson.encode(json))
    end
  else
    json = cjson.decode(redis.call("GET", k))
    json.data = cjson.decode(ARGV[1])
    redis.call("SETEX", k, ttl, cjson.encode(json))
  end
end
return redis.call("SMEMBERS", KEYS[1])
