import {
    Template
} from 'meteor/templating';

import {
    Tasks
} from '../api/tasks.js';
import { Session } from 'meteor/session';

import './task.js';
import './body.html';


Template.body.onCreated(function bodyOnCreated() {
    this.state = new ReactiveDict();
    Session.set("PrioritySort", 1);
    Session.set("Search", "");
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

        if (Session.get("Search") != ""){
          query.text = {'$regex': Session.get("Search")}; /.*Session.get("Search").*/
        }

        // Otherwise, return all of the tasks
        return Tasks.find(query, {
            sort: {
                priority: Session.get("PrioritySort") //, createdAt: -1,
            }
        });
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
    'keyup .search-task'  (event) {
//console.log(event.target, event.target.text, $('.search-task').val());
        Session.set('Search', $('.search-task').val());
    }
});
