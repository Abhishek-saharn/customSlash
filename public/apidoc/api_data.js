define({ "api": [
  {
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "optional": false,
            "field": "varname1",
            "description": "<p>No type.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "varname2",
            "description": "<p>With type.</p>"
          }
        ]
      }
    },
    "type": "",
    "url": "",
    "version": "0.0.0",
    "filename": "./doc/main.js",
    "group": "_home_abhishek_customslash_doc_main_js",
    "groupTitle": "_home_abhishek_customslash_doc_main_js",
    "name": ""
  },
  {
    "type": "post",
    "url": "/pinpoint",
    "title": "Handles all slash cammands inputs.",
    "group": "commands",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>Token for verification of command invocation.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "text",
            "description": "<p>Text written after /pinpoint command.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "team_id",
            "description": "<p>Team id where command executed.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "user_id",
            "description": "<p>User id who executed the command.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "channel_id",
            "description": "<p>Channel id where slash command is executed.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "response_url",
            "description": "<p>It is the Url which can be used for send response back. With this approach, you can respond to a user's command up to 5 times within 30 minutes of the command's invocation.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Input",
          "content": "{\n  \"token\"=\"gIkuvaNzQIHg97ATvDxqgjtO\"\n     \"team_id\" = \"T0001\"\n     \"channel_id\" = \"C2147483705\"\n     \"user_id\" = \"U2147483697\"\n     \"text\" = \"update status 1\"\n     \"response_url\" = \"https://hooks.slack.com/commands/1234/5678\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Authentication error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./routes/commands.routes.js",
    "groupTitle": "commands",
    "name": "PostPinpoint"
  }
] });
