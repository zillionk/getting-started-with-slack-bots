var request = require('request');

module.exports = function (req, res, next) {
  // default roll is 2d6
  var matches;
  var times = 2;
  var die = 6;
  var rolls = [];
  var total = 0;
  var botPayload = {};

  if (req.body.text) {
    // parse roll type if specified
    matches = req.body.text.match(/^.r  *(\d{1}\#)* *(\d{1,2})[dD](\d{1,3}) *([+-])* *(\d{1,3})* *([kK]\d{1})* *([A-Za-z0-9][A-Za-z0-9]*)*$/);

    if (matches && matches[2] && matches[3]) {
      times = matches[2];
      die = matches[3];
      if (matches[4] && matches[5]) {
          adjustSign = matches[4];
          adjustNumber = matches[5];
        };
    } else {
      // send error message back to user if input is bad
      return res.status(200).send('.r <number>d<sides>');
    }
  }
  // check adjust value
  if (matches[4] && matches[5]) {
    adjustInt = parseInt(adjustSign + adjustNumber);
    adjustStr = ' ' + adjustSign + ' *' + adjustNumber + '*';
  } else {
    adjustInt = 0;
    adjustStr = '';
  };

  // check extra message
  if (matches && matches[7]) {
    extraMessage = ' for *' + matches[7] + '*';
  } else{
    extraMessage = '';
  };

  // roll dice and sum
  for (var i = 0; i < times; i++) {
    var currentRoll = roll(1, die);
    rolls.push(currentRoll);
    total += currentRoll;
  }
  // add adjust value
  total += adjustInt;

  // write response message and add to payload

  botPayload.text = req.body.user_name + ' rolled ' + times + 'd' + die + adjustSign + '*' + adjustNumber + '*' + extraMessage + ':\n' +
                    rolls.join(' + ') + adjustStr + ' = *' + total + '*';


  botPayload.username = 'dicebot';
  botPayload.channel = req.body.channel_id;
  botPayload.icon_emoji = ':game_die:';

  // send dice roll
  send(botPayload, function (error, status, body) {
    if (error) {
      return next(error);

    } else if (status !== 200) {
      // inform user that our Incoming WebHook failed
      return next(new Error('Incoming WebHook: ' + status + ' ' + body));

    } else {
      return res.status(200).end();
    }
  });
}


function roll (min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}


function send (payload, callback) {
  var path = '/T04KPKC5M/B04MDKFNP/LtJ3Bhclhg9jMHwiQhf0iMjK';
  var uri = 'https://hooks.slack.com/services' + path;

  request({
    uri: uri,
    method: 'POST',
    body: JSON.stringify(payload)
  }, function (error, response, body) {
    if (error) {
      return callback(error);
    }

    callback(null, response.statusCode, body);
  });
}
