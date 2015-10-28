var fs = require('fs')

var activitiesRaw = require('./../cache/DestinyActivityBundleDefinition')
var activityTypesRaw = require('./../cache/DestinyActivityTypeDefinition')

var activities = {};
var activityTypes = {};

activitiesRaw.forEach(function(item) {
  var activity = {
    name: item.activityName,
    id: item.bundleHash,
    key: item.bundleHash,
    type: item.activityTypeHash
  }
  activities[item.bundleHash] = activity;
})

activityTypesRaw.forEach(function(item) {

  var activity = {
    name: item.activityTypeName,
    id: item.activityTypeHash,
    key: item.identifier
  }

  activityTypes[item.identifier] = activity;
  activityTypes[item.activityTypeHash] = activity;
})


fs.writeFileSync('./cache/activities.json', JSON.stringify({
  'activities': activities,
  'types': activityTypes
}))
