var itemsRaw = require('./../cache/DestinyInventoryItemDefinition.json')
var sourcesRaw = require('./../cache/DestinyRewardSourceDefinition.json')
var bucketsRaw = require('./../cache/DestinyInventoryBucketDefinition.json')
var categoriesRaw = require('./../cache/DestinyItemCategoryDefinition')

var assign = require('object-assign')
var fs = require('fs')
var _ = require('lodash')

var sources = {}
var items = {}
var buckets = {}
var categories = {}

categoriesRaw.forEach(function(item) {
  var category = {
    name: item.title,
    id: item.itemCategoryHash,
    key: item.identifier
  }

  categories[item.identifier] = category;
  categories[item.itemCategoryHash] = category;
})

sourcesRaw.forEach(function(item) {
  var source = {
    name: item.sourceName,
    description: item.description,
    id: item.sourceHash,
    key: item.identifier
  }

  sources[item.identifier] = source;
  sources[item.sourceHash] = source;
})

bucketsRaw.forEach(function(item) {
  var bucket = {
    name: item.bucketName,
    description: item.bucketDescription,
    id: item.bucketHash,
    key: item.bucketIdentifier,
    order: item.bucketOrder
  }

  buckets[bucket.id] = bucket;
  buckets[bucket.key] = bucket;

})

var rootSource = sources.SOURCE_TTK.id;
var allowedSources = [
  sources.SOURCE_STRIKE.id, //Strike
  //sources.SOURCE_TTK.id, // ALL TKK
  //sources.SOURCE_NIGHTFALL.id, //NF
  sources.SOURCE_KINGS_FALL.id, //KF
  //sources.SOURCE_HEROIC.id, //Heroic
  //sources.SOURCE_IRON_BANNER.id, //IB
  //sources.SOURCE_TRIALS_OF_OSIRIS.id, //ToO
  //sources.SOURCE_HIVESHIP.id, //Dreadnought
]

items = itemsRaw.filter(function(item) {

  if (item.itemName && item.itemName.indexOf('Mark of Oblivion') >= 0) {
    console.log(item)
    console.log(buckets[item.bucketTypeHash])
  }

  if (!item.sourceHashes.length && item.itemName && (
    item.itemName.indexOf('Numen') >= 0 ||
    item.itemName.indexOf('Darkhollow') >= 0 ||
    item.itemName.indexOf('Wormlore') >= 0 ||
    item.itemName.indexOf('Yull') >= 0 ||
    item.itemName.indexOf('of Eir') >= 0 ||
    item.itemName.indexOf('Xol') >= 0 ||
    item.itemName.indexOf('Ur') >= 0 ||
    item.itemName.indexOf('Zaouli') >= 0 ||
    item.itemName.indexOf('Drystan') >= 0 ||
    item.itemName.indexOf('Merain') >= 0 ||
    item.itemName.indexOf('Chelchis') >= 0 ||
    item.itemName.indexOf('Yasmin') >= 0 ||
    item.itemName.indexOf('Midha') >= 0 ||
    item.itemName.indexOf('Silence') >= 0 ||
    item.itemName.indexOf('Elulim') >= 0 ||
    item.itemName.indexOf('Terminus') >= 0
  )) {
    item.sourceHashes.push(sources.SOURCE_KINGS_FALL.id)
    item.sourceHashes.push(sources.SOURCE_TTK.id)
  }

  if (item.sourceHashes.indexOf(rootSource) < 0) {
    return false;
  }

  if (
    item.itemName.indexOf('Engram') >= 0 ||
    item.itemName.indexOf('Shard') >= 0 ||
    item.itemName.indexOf('Rune') >= 0 ||
    item.itemName.indexOf('Key of') >= 0
  ) {
    return false;
  }

  if (item.tierType == 6) {
    return true;
  }

  if (_.intersection(item.sourceHashes, allowedSources).length < 1) {
    return false;
  }

  if (item.tierType < 5) {
    return false;
  }

  return true;

}).map(function(item) {

  return {
    name: item.itemName,
    description: item.itemDescription,
    id: item.itemHash,
    hash: item.itemHash,
    icon: item.icon,
    class: item.classType,
    kind: item.itemType,
    type: item.itemTypeName,
    rarity: item.tierType,
    slot: item.bucketTypeHash,
    order: buckets[item.bucketTypeHash].order,
    categories: item.itemCategoryHashes,
    drop: {
      raid: item.sourceHashes.indexOf(sources.SOURCE_KINGS_FALL.id) >= 0,
      strike: item.sourceHashes.indexOf(sources.SOURCE_STRIKE.id) >= 0
    },
    raid: {
      drop: item.sourceHashes.indexOf(sources.SOURCE_KINGS_FALL.id) >= 0,
      hm: item.itemName.indexOf('Harrowed') >= 0
    }
  }
})

var sorted = {}

var exotics = items.filter(function(item) {
  return item.rarity == 6
})

var items = items.filter(function(item) {
  return item.rarity != 6
})

sorted['Strike - Weapons'] = items.filter(function(item) {
  return item.drop.strike && item.class == 3
})

sorted['Strike - Titan Armour'] = items.filter(function(item) {
  return item.drop.strike && item.class === 0
})
sorted['Strike - Hunter Armour'] = items.filter(function(item) {
  return item.drop.strike && item.class === 1
})
sorted['Strike - Warlock Armour'] = items.filter(function(item) {
  return item.drop.strike && item.class === 2
})
sorted['Raid - Weapons'] = items.filter(function(item) {
  return item.drop.raid && item.class == 3 && item.categories.indexOf(categories.CATEGORY_WEAPON.id) >= 0
})
sorted['Raid - Titan Armour'] = items.filter(function(item) {
  return item.drop.raid && item.class === 0
})
sorted['Raid - Hunter Armour'] = items.filter(function(item) {
  return item.drop.raid && item.class === 1
})
sorted['Raid - Warlock Armour'] = items.filter(function(item) {
  return item.drop.raid && item.class === 2
})
sorted['Raid - Other'] = items.filter(function(item) {
  return item.drop.raid && item.class === 3 && item.categories.indexOf(categories.CATEGORY_WEAPON.id) == -1
})
sorted['Exotic - Weapons'] = exotics.filter(function(item) {
  return item.class == 3
})
sorted['Exotic - Titan Armour'] = exotics.filter(function(item) {
  return item.class === 0
})
sorted['Exotic - Hunter Armour'] = exotics.filter(function(item) {
  return item.class === 1
})
sorted['Exotic - Warlock Armour'] = exotics.filter(function(item) {
  return item.class === 2
})

var items = {}

_.forOwn(sorted, function(lot, key) {
  return items[key] = _.sortByAll(lot, ['raid.hm', 'order', 'name'])
})


fs.writeFileSync('./cache/loot.json', JSON.stringify({
  'items': items,
  'sources': sources
}))
