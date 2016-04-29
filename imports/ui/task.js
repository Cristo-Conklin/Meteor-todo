import {
    Template
} from 'meteor/templating';
import {
    Meteor
} from 'meteor/meteor';
import {
    Tasks
} from '../api/tasks.js';

import './task.html';

Template.task.helpers({
    isOwner() {
        return this.owner === Meteor.userId();
    },
});

Template.task.events({
    'click .toggle-checked' () {
        // Set the checked property to the opposite of its current value
        Meteor.call('tasks.setChecked', this._id, !this.checked);
    },
    'click .delete' () {
        Meteor.call('tasks.remove', this._id);
    },
    'click .toggle-private' () {
        Meteor.call('tasks.setPrivate', this._id, !this.private);
    },

    'change .toggle-priority': function(event) {
        console.log('change .toggle-priority', this._id, event.target.value);
        Meteor.call('tasks.setPriority', this._id, event.target.value);

        Session.set("PrioritySort", 0); // force value change to react
        Session.set("PrioritySort", 1);
    },

    'click .edit-tag': function(event) {
        tagText = $('#tagText'+ this._id).val();
        //console.log(tagText, this, event);
        if (tagText != "")
          Meteor.call('tasks.upsertTag', this._id, tagText);
    },

});
