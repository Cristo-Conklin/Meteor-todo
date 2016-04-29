import {
    Template
} from 'meteor/templating';

import {
    Tasks
} from '../api/tasks.js';
import {
    Session
} from 'meteor/session';

import './task.js';
import './body.html';


Template.body.onCreated(function bodyOnCreated() {
    this.state = new ReactiveDict();
    Session.set("PrioritySort", 1);
    Session.set("Search", "");
    Session.set('tagsArray', new Array());
    Meteor.subscribe('tasks');
});

Template.body.helpers({
    tasks() {
        const instance = Template.instance();
        var query = {};

        if (instance.state.get('hideCompleted')) {
            // If hide completed is checked, filter tasks
            query['checked'] = {
                $ne: true
            };
        }

        if (Session.get("Search") != "") {
            query.text = {
                '$regex': Session.get("Search")
            };
        }

        console.log('q tagsarray', Session.get('tagsArray'), Session.get('tagsArray').length);

        if (Session.get('tagsArray').length > 0) {
            query.tags = {
                $in: Session.get('tagsArray')
            }
        }

        // Otherwise, return all of the tasks
        return Tasks.find(query, {
            sort: {
                priority: Session.get("PrioritySort") //, createdAt: -1,
            }
        });
    },
    uniqueTags() {
        result = _.uniq(Tasks.find({}, {
            sort: {
                tags: 1
            },
            fields: {
                tags: true
            }
        }).map(function(x) {
            return x.tags;
        }), false);

        if (result == undefined) return;

        tags = [];
        // extract helper
        for (var i = 0; i < result.length; i++) {
            if (result[i] == undefined) continue;
            //console.log('i', i, result[i].length, result[i]);
            for (var j = 0; j < result[i].length; j++) {
                tag = result[i][j];
                //console.log('j', j, tag);
                tags[tag] = true;
            }
        } // / helper f

        //console.log('tags: ', Object.keys(tags));
        return Object.keys(tags).sort();

    },
    incompleteCount() {
        return Tasks.find({
            $and: [{
                checked: {
                    $ne: true
                }
            }, {
                owner: Meteor.userId()
            }]
        }).count();
    },
});

Template.body.events({
    'submit .new-task' (event) {
        // Prevent default browser form submit
        event.preventDefault();

        // Get value from form element
        const target = event.target;
        const text = target.text.value;

        // Insert a task into the collection
        Meteor.call('tasks.insert', text);

        // Clear form
        target.text.value = '';
    },
    'change .hide-completed input' (event, instance) {
        instance.state.set('hideCompleted', event.target.checked);
    },
    'keyup .search-task' (event) {
        //console.log(event.target, event.target.text, $('.search-task').val());
        Session.set('Search', $('.search-task').val());
    },
    'click .js-tag-check' (event) {
        checked = event.target.checked;
        tag = event.target.id;
        console.log(checked, tag);

        tagsArray = Session.get('tagsArray');
        console.log(typeof tagsArray, tagsArray);
        if (checked) {
            tagsArray.push(tag)
            Session.set('tagsArray', tagsArray);
        } else {
            i = tagsArray.indexOf(tag);
            if (i > -1) {
                tagsArray.splice(i, 1);
                Session.set('tagsArray', tagsArray);
            }

        }

        // do array with checked keys
        /* Plan B
        checkedTags = [];
        $('.js-tag-check').each(function(index, value) {
            console.log(index, value);
        }); */
        // Session.set('tagsArray', tags);
    }
});
