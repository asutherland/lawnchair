/**
 * Lawnchair
 * =========
 * A lightweight JSON document store.
 *
 */
var Lawnchair = function(opts, cb) {
    if (typeof cb == 'undefined') throw "Please provide a callback as second parameter to Lawnchair constructor; this shit's async, yo.";
    if (!JSON || !JSON.stringify) throw "Native JSON functions unavailable - please include http://www.json.org/json2.js or run on a decent browser :P";
	this.init(opts);
	cb.call(this);
}

Lawnchair.prototype = {

	init:function(opts) {
		var adaptors = {
			'webkit':window.WebkitSQLiteAdaptor,
			'gears':window.GearsSQLiteAdaptor,
			'dom':window.DOMStorageAdaptor,
			'cookie':window.CookieAdaptor,
			'air':window.AIRSQLiteAdaptor,
			'userdata':window.UserDataAdaptor,
			'air-async':window.AIRSQLiteAsyncAdaptor,
			'blackberry':window.BlackBerryPersistentStorageAdaptor,
            'couch':window.CouchAdaptor,
            'server':window.ServerAdaptor
		};
		this.adaptor = opts.adaptor ? new adaptors[opts.adaptor](opts) : new DOMStorageAdaptor(opts);
	},

	// Save an object to the store. If a key is present then update. Otherwise create a new record.
	save:function(obj, callback) {this.adaptor.save(obj, callback)},

	beginBatch:function(callback) {this.adaptor.beginBatch(callback)},
	endBatch:function(callback) {this.adaptor.endBatch(callback)},

	// Invokes a callback on an object with the matching key.
	get:function(key, callback) {this.adaptor.get(key, callback)},

	// Returns whether a key exists to a callback.
	exists:function(callback) {this.adaptor.exists(callback)},

	// Returns all rows to a callback.
	all:function(callback) {this.adaptor.all(callback)},

	// Removes a json object from the store.
	remove:function(keyOrObj, callback) {this.adaptor.remove(keyOrObj, callback)},

	// Removes all documents from a store and returns self.
	nuke:function(callback) {this.adaptor.nuke(callback);return this},

	// Returns a page of results based on offset provided by user and perPage option
	paged:function(page, callback) {this.adaptor.paged(page, callback)},

	/**
	 * Iterator that accepts two paramters (methods or eval strings):
	 *
	 * - conditional test for a record
	 * - callback to invoke on matches
	 *
	 */
	find:function(condition, callback) {
		var is = (typeof condition == 'string') ? function(r){return eval(condition)} : condition
		  , cb = this.adaptor.terseToVerboseCallback(callback);

		this.each(function(record, index) {
			if (is(record)) cb(record, index); // thats hot
		});
	},


	/**
	 * Classic iterator.
	 * - Passes the record and the index as the second parameter to the callback.
	 * - Accepts a string for eval or a method to be invoked for each document in the collection.
	 */
	each:function(callback) {
		var cb = this.adaptor.terseToVerboseCallback(callback);
		this.all(function(results) {
			var l = results.length;
			for (var i = 0; i < l; i++) {
				cb(results[i], i);
			}
		});
	}
// --
};
/**
 * LawnchairAdaptorHelpers
 * =======================
 * Useful helpers for creating Lawnchair stores. Used as a mixin.
 *
 */
var LawnchairAdaptorHelpers = {
	// merging default properties with user defined args
	merge: function(defaultOption, userOption) {
		return (userOption == undefined || userOption == null) ? defaultOption: userOption;
	},

	// awesome shorthand callbacks as strings. this is shameless theft from dojo.
	terseToVerboseCallback: function(callback) {
		return (typeof arguments[0] == 'string') ?
		function(r, i) {
			eval(callback);
		}: callback;
	},

	// Returns current datetime for timestamps.
	now: function() {
		return new Date().getTime();
	},

	// Returns a unique identifier
	uuid: function(len, radix) {
		// based on Robert Kieffer's randomUUID.js at http://www.broofa.com
		var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
		var uuid = [];
		radix = radix || chars.length;

		if (len) {
			for (var i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
		} else {
			// rfc4122, version 4 form
			var r;

			// rfc4122 requires these characters
			uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
			uuid[14] = '4';

			// Fill in random data.  At i==19 set the high bits of clock sequence as
			// per rfc4122, sec. 4.1.5
			for (var i = 0; i < 36; i++) {
				if (!uuid[i]) {
					r = 0 | Math.random() * 16;
					uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8: r];
				}
			}
		}
		return uuid.join('');
	},

	// Serialize a JSON object as a string.
	serialize: function(obj) {
		var r = '';
		r = JSON.stringify(obj);
		return r;
	},

	// Deserialize JSON.
	deserialize: function(json) {
		return eval('(' + json + ')');
	}
};
// init.js directly included to save on include traffic
//
// Copyright 2007, Google Inc.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
//	1. Redistributions of source code must retain the above copyright notice,
//		 this list of conditions and the following disclaimer.
//	2. Redistributions in binary form must reproduce the above copyright notice,
//		 this list of conditions and the following disclaimer in the documentation
//		 and/or other materials provided with the distribution.
//	3. Neither the name of Google Inc. nor the names of its contributors may be
//		 used to endorse or promote products derived from this software without
//		 specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO
// EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
// PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
// OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
// WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
// OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// Sets up google.gears.*, which is *the only* supported way to access Gears.
//
// Circumvent this file at your own risk!
//
// In the future, Gears may automatically define google.gears.* without this
// file. Gears may use these objects to transparently fix bugs and compatibility
// issues. Applications that use the code below will continue to work seamlessly
// when that happens.

(function() {
	// We are already defined. Hooray!
	if (window.google && google.gears) {
		return;
	}

	var factory = null;

	// Firefox
	if (typeof GearsFactory != 'undefined') {
		factory = new GearsFactory();
	} else {
		// IE
		try {
			factory = new ActiveXObject('Gears.Factory');
			// privateSetGlobalObject is only required and supported on IE Mobile on
			// WinCE.
			if (factory.getBuildInfo().indexOf('ie_mobile') != -1) {
				factory.privateSetGlobalObject(this);
			}
		} catch (e) {
			// Safari
			if ((typeof navigator.mimeTypes != 'undefined')
					 && navigator.mimeTypes["application/x-googlegears"]) {
				factory = document.createElement("object");
				factory.style.display = "none";
				factory.width = 0;
				factory.height = 0;
				factory.type = "application/x-googlegears";
				document.documentElement.appendChild(factory);
			}
		}
	}

	// *Do not* define any objects if Gears is not installed. This mimics the
	// behavior of Gears defining the objects in the future.
	if (!factory) {
		return;
	}

	// Now set up the objects, being careful not to overwrite anything.
	//
	// Note: In Internet Explorer for Windows Mobile, you can't add properties to
	// the window object. However, global objects are automatically added as
	// properties of the window object in all browsers.
	if (!window.google) {
		google = {};
	}

	if (!google.gears) {
		google.gears = {factory: factory};
	}
})();

/**
 * GearsSQLiteAdaptor
 * ===================
 * Gears flavored SQLite implementation for Lawnchair.
 *
 */
var GearsSQLiteAdaptor = function(options) {
	for (var i in LawnchairAdaptorHelpers) {
		this[i] = LawnchairAdaptorHelpers[i];
	}
	this.init(options);
};


GearsSQLiteAdaptor.prototype = {
	init:function(options) {
		var that = this;
		var merge = that.merge;
		var opts = (typeof arguments[0] == 'string') ? {table:options} : options;
		this.name = merge('Lawnchair', opts.name);
		this.table = merge('field', opts.table);
		this.db = google.gears.factory.create('beta.database');
		this.db.open(this.name);
		this.db.execute('create table if not exists ' + this.table + ' (id NVARCHAR(32) UNIQUE PRIMARY KEY, value TEXT, timestamp REAL)');
	},
	save:function(obj, callback) {
		var that = this;

		var insert = function(obj, callback) {
			var id = (typeof obj.key == 'undefined') ? that.uuid() : obj.key;
			delete(obj.key);

			var rs = that.db.execute(
				"INSERT INTO " + that.table + " (id, value, timestamp) VALUES (?,?,?)",
				[id, that.serialize(obj), that.now()]
			);
			if (typeof callback != 'undefined') {
				obj.key = id;
				that.terseToVerboseCallback(callback)(obj);
			}
		};

		var update = function(id, obj, callback) {
			that.db.execute(
				"UPDATE " + that.table + " SET value=?, timestamp=? WHERE id=?",
				[that.serialize(obj), that.now(), id]
			);
			if (typeof callback != 'undefined') {
				obj.key = id;
				that.terseToVerboseCallback(callback)(obj);
			}
		};

		if (typeof obj.key == 'undefined') {
			insert(obj, callback);
		} else {
			this.get(obj.key, function(r) {
				var isUpdate = (r != null);

				if (isUpdate) {
					var id = obj.key;
					delete(obj.key);
					update(id, obj, callback);
				} else {
					insert(obj, callback);
				}
			});
		}

	},
        beginBatch: function(callback) {
          this.db.execute("BEGIN");
        },
        endBatch: function(callback) {
          this.db.execute("COMMIT");
        },
	get:function(key, callback) {
		var rs = this.db.execute("SELECT * FROM " + this.table + " WHERE id = ?", [key]);

		if (rs.isValidRow()) {
			// FIXME need to test null return / empty recordset
			var o = this.deserialize(rs.field(1));
			o.key = key;
			rs.close();
			this.terseToVerboseCallback(callback)(o);
		} else {
			rs.close();
			this.terseToVerboseCallback(callback)(null);
		}
	},
	all:function(callback) {
		var cb	= this.terseToVerboseCallback(callback);
		var rs	= this.db.execute("SELECT * FROM " + this.table);
		var r		= [];
		var o;

		// FIXME need to add 0 len support
		//if (results.rows.length == 0 ) {
		//	cb([]);

		while (rs.isValidRow()) {
			o = this.deserialize(rs.field(1));
			o.key = rs.field(0);
				r.push(o);
				rs.next();
		}
		rs.close();
		cb(r);
	},
	remove:function(keyOrObj, callback) {
		this.db.execute(
			"DELETE FROM " + this.table + " WHERE id = ?",
			[(typeof keyOrObj == 'string') ? keyOrObj : keyOrObj.key]
		);
		if(typeof callback != 'undefined')
		  this.terseToVerboseCallback(callback)();
	},
	nuke:function(callback) {
		this.db.execute("DELETE FROM " + this.table);
		if(typeof callback != 'undefined')
		  this.terseToVerboseCallback(callback)();
		return this;
	}
};
/**
 * DOMStorageAdaptor
 * ===================
 * DOM Storage implementation for Lawnchair.
 *
 * - originally authored by Joseph Pecoraro
 * - window.name code courtesy Remy Sharp: http://24ways.org/2009/breaking-out-the-edges-of-the-browser
 *
 */
var DOMStorageAdaptor = function(options) {
	for (var i in LawnchairAdaptorHelpers) {
		this[i] = LawnchairAdaptorHelpers[i];
	}
	this.init(options);
};


DOMStorageAdaptor.prototype = {
	init:function(options) {
		var self = this;
		this.storage = this.merge(window.localStorage, options.storage);
		this.table = this.merge('field', options.table);

		if (!window.Storage) {
			this.storage = (function () {
				// window.top.name ensures top level, and supports around 2Mb
				var data = window.top.name ? self.deserialize(window.top.name) : {};
				return {
					setItem: function (key, value) {
						data[key] = value+""; // force to string
						window.top.name = self.serialize(data);
					},
					removeItem: function (key) {
						delete data[key];
						window.top.name = self.serialize(data);
					},
					getItem: function (key) {
						return data[key] || null;
					},
					clear: function () {
						data = {};
						window.top.name = '';
					}
				};
			})();
		};
	},

	save:function(obj, callback) {
		var id = this.table + '::' + (obj.key || this.uuid());
		delete obj.key;
		this.storage.setItem(id, this.serialize(obj));
		if (callback) {
		    obj.key = id.split('::')[1];
		    this.terseToVerboseCallback(callback)(obj);
		}
	},

    beginBatch: function(callback) {
    },
    endBatch: function(callback) {
    },

    get:function(key, callback) {
        var obj = this.deserialize(this.storage.getItem(this.table + '::' + key))
          , cb = this.terseToVerboseCallback(callback);

        if (obj) {
            obj.key = key;
            if (callback) cb(obj);
        } else {
			if (callback) cb(null);
		}
    },

	all:function(callback) {
		var cb = this.terseToVerboseCallback(callback);
		var results = [];
		for (var i = 0, l = this.storage.length; i < l; ++i) {
			var id = this.storage.key(i);
			var tbl = id.split('::')[0]
			var key = id.split('::').slice(1).join("::");
			if (tbl == this.table) {
				var obj = this.deserialize(this.storage.getItem(id));
				obj.key = key;
				results.push(obj);
			}
		}
		if (cb)
			cb(results);
	},

	remove:function(keyOrObj, callback) {
		var key = this.table + '::' + (typeof keyOrObj === 'string' ? keyOrObj : keyOrObj.key);
		this.storage.removeItem(key);
		if(callback)
		  this.terseToVerboseCallback(callback)();
	},

	nuke:function(callback) {
		var self = this;
		this.all(function(r) {
			for (var i = 0, l = r.length; i < l; i++) {
				self.remove(r[i]);
			}
			if(callback)
			  self.terseToVerboseCallback(callback)();
		});
	}
};
