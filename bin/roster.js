var rp = require('request-promise')
var async = require('async')
var fs = require('fs')
var argv = require('yargs').argv
var assign = require('object-assign')

function rosterUri(clan) {
  return 'https://www.bungie.net/platform/Group/'+clan+'/ClanMembers/'
}

function memberUri(id, type) {
  return 'https://www.bungie.net/Platform/User/GetBungieAccount/'+id+'/'+type+'/'
}

var options = {
    qs: {
      platformType: 2,
      itemsPerPage: 10
    },
    json: true,
    headers: {
    'X-API-Key': '569089b0134d4770b00b680190357eb5'
  },
  gzip: true
};

var users = []


function roster(clan) {
  options.uri = rosterUri(clan)

  return (function go(page) {
    options.qs.currentPage = page
    console.log('Sending: ', options.uri+page )
    return rp(options).then(function(response) {
      response.Response.results.forEach(function(user) {
        if (!user.bungieNetUserInfo) {
          return;
        }
        users.push({
          name: user.bungieNetUserInfo.displayName,
          membership: {
            id: user.bungieNetUserInfo.membershipId,
            type: user.bungieNetUserInfo.membershipType
          },
          clan: user.groupId
        })
      })
      if (response.Response.hasMore) {
        return go(page+1)
      }
    })
  })(1)
}

var members = []


function all() {
  roster(114759).then(function() {
    return roster(166560)
  }).then(function() {
    return roster(606969)
  }).then(function() {

    console.log('Writing users')
    fs.writeFileSync('./cache/users.json', JSON.stringify(users))
    console.log('Users cached')

    accounts()
  })
}


function accounts() {

  var q = async.queue(function(opt, callback) {

    var options = opt.options;
    var user = opt.user;

    console.log('Sending: ', options.uri )

    rp(options).then(function(response) {
      if (!response.Response.destinyAccounts[0]) {
        callback()
        return;
      }

      var member = {
        name: {
          bungie: response.Response.bungieNetUser.displayName,
          platform: response.Response.bungieNetUser.psnDisplayName
        },
        id: {
          bungie: user.membership.id,
          destiny: response.Response.destinyAccounts[0].userInfo.membershipId
        },
        platform: response.Response.destinyAccounts[0].userInfo.membershipType,
        clan: {
          name: response.Response.destinyAccounts[0].clanName,
          tag: response.Response.destinyAccounts[0].clanTag,
        },
        avatar: response.Response.bungieNetUser.profilePicturePath
      }
      members.push(member)
      callback()
    })
  }, 4);

  users.forEach(function(user) {
    var opt = assign({}, options, {uri: memberUri(user.membership.id, user.membership.type)})
    q.push({options: opt, user: user})
  })

  q.drain = function() {
    console.log('Writing members')
    fs.writeFileSync('./cache/members.json', JSON.stringify(members))
    console.log('Members cached')
  }
}

if (!argv.c && fs.existsSync('./cache/users.json')) {
  var users = require('./../cache/users.json')

  if (!argv.m && fs.existsSync('./cache/members.json')) {
    var members = require('./../cache/members.json')
    //roster()
  } else {
      accounts()
  }

} else {
  all()
}
