/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function() {
  "use strict";

  // The chunk size of tailing the files, i.e., how many bytes will be shown
  // in the preview.
  var TAIL_CHUNK_SIZE = 32768;

  //This stores the current directory which is being browsed
  var current_directory = "";

  function show_err_msg(msg) {
    $('#alert-panel-body').html(msg);
    $('#alert-panel').show();
  }

  $(window).bind('hashchange', function () {
    $('#alert-panel').hide();

    var dir = decodeURIComponent(window.location.hash.slice(1));
    if(dir == "") {
      dir = "/";
    }
    if(current_directory != dir) {
      browse_directory(dir);
    }
  });

  function network_error_handler(url) {
    return function (jqxhr, text, err) {
      switch(jqxhr.status) {
        case 401:
          var msg = '<p>Authentication failed when trying to open ' + url + ': Unauthorized.</p>';
          break;
        case 403:
          if(jqxhr.responseJSON !== undefined && jqxhr.responseJSON.RemoteException !== undefined) {
            var msg = '<p>' + jqxhr.responseJSON.RemoteException.message + "</p>";
            break;
          }
          var msg = '<p>Permission denied when trying to open ' + url + ': ' + err + '</p>';
          break;
        case 404:
          var msg = '<p>Path does not exist on HDFS or WebHDFS is disabled.  Please check your path or enable WebHDFS</p>';
          break;
        default:
          var msg = '<p>Failed to retrieve data from ' + url + ': ' + err + '</p>';
        }
      show_err_msg(msg);
    };
  }

  $(document).ready(function(){
    var auth = window.localStorage.getItem("auth");
    if (!auth) {
      document.getElementById("overlay").style.display = "block";
    }
  })

  $("#hdfs-login").click(function() {
    clearLoginErrors();
    authenticate();
  })

  $(".login-input").change(function() {
    clearLoginErrors();
  })

  $(".login-input").keypress(function(event) {
    if (event.which == 13) {
      clearLoginErrors();
      authenticate()
    }
  })

  async function authenticate() {
    var errorMessage = "";
    var importedUsers = await import('./userList.js');
    var userList = importedUsers.default;
    var username = btoa($("input[name=hdfs-username]").val());
    var password = btoa($("input[name=hdfs-password]").val());
    
    if (!username | !password) {
      errorMessage = "<p>Please specify username and password.</p>"
    } else if (!userList|| !userList.length) {
      errorMessage = "<p>Incorrect username or password.</p>"
    }
    if (errorMessage) {
      handleLoginError(errorMessage);
    } else {
      var givenUser = userList.find(function(user) {
        return user.username === username && user.password === password;
      });
      if (!givenUser) {
        handleLoginError("<p>Incorrect username or password.</p>");
      } else {
        window.localStorage.setItem("auth", givenUser)
        document.getElementById("overlay").style.display = "none";
      }
    }
  }

  function handleLoginError(msg) {
    $("#login-error").append(msg)
    $("#login-error").show();
  }

  function clearLoginErrors() {
    $("#login-error").hide();
    $("#login-error").empty();
  }

  function append_path(prefix, s) {
    var l = prefix.length;
    var p = l > 0 && prefix[l - 1] == '/' ? prefix.substring(0, l - 1) : prefix;
    return p + '/' + s;
  }

  function get_response(data, type) {
    return data[type] !== undefined ? data[type] : null;
  }

  function get_response_err_msg(data) {
    return data.RemoteException !== undefined ? data.RemoteException.message : "";
  }

  function encode_path(abs_path) {
    abs_path = encodeURIComponent(abs_path);
    var re = /%2F/g;
    return abs_path.replace(re, '/');
  }

  function view_file_details(path, abs_path) {
    function show_block_info(blocks) {
      var menus = $('#file-info-blockinfo-list');
      menus.empty();

      menus.data("blocks", blocks);
      menus.change(function() {
        var d = $(this).data('blocks')[$(this).val()];
        if (d === undefined) {
          return;
        }

        dust.render('block-info', d, function(err, out) {
          $('#file-info-blockinfo-body').html(out);
        });

      });
      for (var i = 0; i < blocks.length; ++i) {
        var item = $('<option value="' + i + '">Block ' + i + '</option>');
        menus.append(item);
      }
      menus.change();
    }

    abs_path = encode_path(abs_path);
    var url = '/webhdfs/v1' + abs_path + '?op=GET_BLOCK_LOCATIONS';
    $.ajax({url: url, dataType: 'text'}).done(function(data_text) {
      var data = JSONParseBigNum(data_text);
      var d = get_response(data, "LocatedBlocks");
      if (d === null) {
        show_err_msg(get_response_err_msg(data));
        return;
      }

      $('#file-info-tail').hide();
      $('#file-info-title').text("File information - " + path);

      var download_url = '/webhdfs/v1' + abs_path + '?op=OPEN';

      $('#file-info-download').attr('href', download_url);

      var processPreview = function(url) {
        url += "&noredirect=true";
        $.ajax({
          type: 'GET',
          url: url,
          processData: false,
          crossDomain: true
        }).done(function(data) {
          url = data.Location;
          $.ajax({
            type: 'GET',
            url: url,
            processData: false,
            crossDomain: true
          }).complete(function(data) {
            $('#file-info-preview-body').val(data.responseText);
            $('#file-info-tail').show();
          }).error(function(jqXHR, textStatus, errorThrown) {
            show_err_msg("Couldn't preview the file. " + errorThrown);
          });
        }).error(function(jqXHR, textStatus, errorThrown) {
          show_err_msg("Couldn't find datanode to read file from. " + errorThrown);
        });
      }

      $('#file-info-preview-tail').click(function() {
        var offset = d.fileLength - TAIL_CHUNK_SIZE;
        var url = offset > 0 ? download_url + '&offset=' + offset : download_url;
        processPreview(url);
      });
      $('#file-info-preview-head').click(function() {
        var url = d.fileLength > TAIL_CHUNK_SIZE ? download_url + '&length=' + TAIL_CHUNK_SIZE : download_url;
        processPreview(url);
      });

      if (d.fileLength > 0) {
        show_block_info(d.locatedBlocks);
        $('#file-info-blockinfo-panel').show();
      } else {
        $('#file-info-blockinfo-panel').hide();
      }
      $('#file-info').modal();
    }).error(network_error_handler(url));
  }

  function func_size_render(data, type, row, meta) {
    if(type == 'display') {
      return dust.filters.fmt_bytes(data);
    }
    else return data;
  }

  // Change the format of date-time depending on how old the
  // the timestamp is. If older than 6 months, no need to be
  // show exact time.
  function func_time_render(data, type, row, meta) {
    if(type == 'display') {
      var cutoff = moment().subtract(6, 'months').unix() * 1000;
      if(data < cutoff) {
        return moment(Number(data)).format('MMM DD YYYY');
      } else {
        return moment(Number(data)).format('MMM DD HH:mm');
      }
    }
    return data;
  }

  function browse_directory(dir) {
    var HELPERS = {
      'helper_date_tostring' : function (chunk, ctx, bodies, params) {
        var value = dust.helpers.tap(params.value, chunk, ctx);
        return chunk.write('' + moment(Number(value)).format('ddd MMM DD HH:mm:ss ZZ YYYY'));
      }
    };
    var url = '/webhdfs/v1' + encode_path(dir) + '?op=LISTSTATUS';
    $.get(url, function(data) {
      var d = get_response(data, "FileStatuses");
      if (d === null) {
        show_err_msg(get_response_err_msg(data));
        return;
      }

      current_directory = dir;
      $('#directory').val(dir);
      window.location.hash = dir;
      var base = dust.makeBase(HELPERS);
      dust.render('explorer', base.push(d), function(err, out) {
        $('#panel').html(out);


        $('.explorer-browse-links').click(function() {
          var type = $(this).attr('inode-type');
          var path = $(this).closest('tr').attr('inode-path');
          var abs_path = append_path(current_directory, path);
          if (type == 'DIRECTORY') {
            browse_directory(abs_path);
          } else {
            view_file_details(path, abs_path);
          }
        });

        //Set the handler for changing permissions
        $('.explorer-perm-links').click(function() {
          var filename = $(this).closest('tr').attr('inode-path');
          var abs_path = append_path(current_directory, filename);
          var perms = $(this).closest('tr').attr('data-permission');
          view_perm_details($(this), filename, abs_path, perms);
        });

        $('#file-selector-all').click(function() {
          $('.file_selector').prop('checked', $('#file-selector-all')[0].checked );
        });

        //This needs to be last because it repaints the table
        $('#table-explorer').dataTable( {
          'lengthMenu': [ [25, 50, 100, -1], [25, 50, 100, "All"] ],
          'columns': [
            { 'orderable' : false }, //select
            {'searchable': false }, //Permissions
            null, //Owner
            null, //Group
            { 'searchable': false, 'render': func_size_render}, //Size
            { 'searchable': false, 'render': func_time_render}, //Last Modified
            { 'searchable': false }, //Replication
            null, //Block Size
            null, //Name
          ],
          "deferRender": true
        });
      });
    }).error(network_error_handler(url));
  }


  function init() {
    dust.loadSource(dust.compile($('#tmpl-explorer').html(), 'explorer'));
    dust.loadSource(dust.compile($('#tmpl-block-info').html(), 'block-info'));

    var b = function() { browse_directory($('#directory').val()); };
    $('#btn-nav-directory').click(b);
    //Also navigate to the directory when a user presses enter.
    $('#directory').on('keyup', function (e) {
      if (e.which == 13) {
        browse_directory($('#directory').val());
      }
    });
    var dir = window.location.hash.slice(1);
    if(dir == "") {
      window.location.hash = "/";
    } else {
      browse_directory(dir);
    }
  }
  
  init();
})();
