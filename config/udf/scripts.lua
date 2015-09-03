function getTTL(r)
  if aerospike:exists(r) then
    return record.ttl(r)
  else
    return -1
  end
end

function getAndTouchRecord(r)
  if aerospike:exists(r) then
    if r['ttl'] >= 1 then
      record.set_ttl(r, r['ttl'])
      aerospike:update(r)
    end
    local bins = record.bin_names(r)
    local obj = map()
    for i, n in ipairs(bins) do
      obj[n] = r[n]
    end
    return obj
  else
    return nil
  end
end

function updateRecord(r, data)
  local ttl
  if aerospike:exists(r) then
    ttl = record.ttl(r)
    r['data'] = data
    record.set_ttl(r, ttl)
    aerospike:update(r)
    return ttl
  else
    return nil
  end
end
