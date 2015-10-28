var rp = require('request-promise')
var async = require('async')
var assign = require('object-assign')
var util = require('util')
var moment = require('moment')
var _ = require('lodash')

var statusUri = 'https://www.bungie.net/Platform/Destiny/%s/Account/%s/Summary/?definitions=False'
var activityUri = 'http://www.bungie.net/Platform/Destiny/Stats/ActivityHistory/%s/%s/%s?mode=None&count=1'

var activities = require('../../cache/activities.json')

var requestOptions = {
  json: true,
  headers: {
    'X-API-Key': '569089b0134d4770b00b680190357eb5'
  },
  gzip: true
}

var Roster = function(members) {

  this.roster = []

  this.pushStatusCheck = function(member) {
    this.statusQueue.push(member, function(err) {
      if (!err) return; console.error(err.stack)
    })
  }

  this.pushActivityCheck = function(member) {
    this.activityQueue.push(member, function(err) {
      if (!err) return; console.error(err.stack)
    })
  }


  this.scheduleStatusCheck = function(member) {
    setTimeout(function() {
      this.pushStatusCheck(member)
    }.bind(this), 1000 * 60 * 5)
  }

  this.scheduleActivityCheck = function(member) {
    setTimeout(function() {
      this.pushStatusCheck(member)
    }.bind(this), 1000 * 60 * 2)
  }

  this.start = function() {

    members.forEach(function(member, index) {
      var mbr = {member: member, status: {online: false}, debug: (index+1)+'/'+members.length}
      this.roster.push(mbr)
      this.pushStatusCheck(mbr)
    }, this)

  }

  function findLastActivity(characters) {

    characters = _.sortByOrder(characters, ['characterBase.dateLastPlayed'], ['desc'])

    var active = characters.filter(function(character) {
      var lastSeen = moment.utc(character.characterBase.dateLastPlayed).add(2, 'minutes')
      var length = character.characterBase.minutesPlayedThisSession * 60
      var compare = moment.utc().subtract(length, 'seconds')
      return lastSeen >= compare
    })

    if (active.length) {
      return {
        online: true,
        duration: active[0].characterBase.minutesPlayedThisSession * 60,
        character: active[0].characterBase.characterId
      }
    } else {
      return {
        online: false,
        duration: 0,
        lastSeen: moment.utc(characters[0].characterBase.dateLastPlayed).unix()
      }
    }
  }

  this.activity = function(member, queueCallback) {

    if (!member.status.character) {
      return queueCallback()
    }

    rp(assign({}, requestOptions, {
      uri: util.format(activityUri, member.member.platform, member.member.id.destiny, member.status.character)
    })).then(function(response) {

      var activity = activities.activities[response.Response.data.activities[0].activityDetails.referenceId]

      if(!activity) {
        return queueCallback();
      }

      member.activity = {
        name: activity.name,
        type: activities.types[activity.type].name
      }

      this.scheduleActivityCheck(member)

      queueCallback()

    }.bind(this)).catch(queueCallback).done()

  }

  this.activityQueue = async.queue(this.activity.bind(this), 2)

  this.status = function(member, queueCallback) {



    rp(assign({}, requestOptions, {
      uri: util.format(statusUri, member.member.platform, member.member.id.destiny)
    })).then(function(response) {

        var characters = response.Response.data.characters;

        var activity = findLastActivity(characters)

        member.status = activity;

        if (activity.online) {
          this.pushActivityCheck(member)
        }

        this.scheduleStatusCheck(member)

        queueCallback();

    }.bind(this)).catch(queueCallback).done()

  }

  this.statusQueue = async.queue(this.status.bind(this), 10)

  this.statusQueue.drain = function() {
    console.log('Status queue drained')
  }.bind(this)

  this.activityQueue.drain = function() {
    console.log('Activity queue drained')
  }.bind(this)

  this.all = function() {

    var roster = _.sortByOrder(this.roster, ['status.duration', 'status.lastSeen'], ['desc', 'desc'])

    return roster
  }
}

module.exports = Roster
