import {
    Meteor
} from 'meteor/meteor';
import {
    Mongo
} from 'meteor/mongo';
import {
    check
} from 'meteor/check';
import { Session } from 'meteor/session';

export const Tasks = new Mongo.Collection('tasks');

if (Meteor.isServer) {
    // This code only runs on the server
    // Only publish tasks that are public or belong to the current user
    Meteor.publish('tasks', function tasksPublication() {
        return Tasks.find({
                $or: [{
                    private: {
                        $ne: true
                    }
                }, {
                    owner: this.userId
                }]
            }, /*{
                sort: {
                    priority: -1//, createdAt: -1,
                }
            }*/
          );
    });
}

Meteor.methods({
    'tasks.insert' (text) {
        check(text, String);

        // Make sure the user is logged in before inserting a task
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        Tasks.insert({
            text,
            createdAt: new Date(),
            owner: Meteor.userId(),
            username: Meteor.user().username,
            priority: 2,
        });
    },
    'tasks.remove' (taskId) {
        check(taskId, String);

        const task = Tasks.findOne(taskId);
        if (task.private && task.owner !== Meteor.userId()) {
            // If the task is private, make sure only the owner can delete it
            throw new Meteor.Error('not-authorized');
        }
        Tasks.remove(taskId);
    },
    'tasks.setChecked' (taskId, setChecked) {
        check(taskId, String);
        check(setChecked, Boolean);

        // DRY, extract method authPass
        const task = Tasks.findOne(taskId);
        if (task.private && task.owner !== Meteor.userId()) {
            // If the task is private, make sure only the owner can check it off
            throw new Meteor.Error('not-authorized');
        }

        Tasks.update(taskId, {
            $set: {
                checked: setChecked
            }
        });
    },
    'tasks.setPrivate' (taskId, setToPrivate) {
        check(taskId, String);
        check(setToPrivate, Boolean);

        const task = Tasks.findOne(taskId);

        // Make sure only the task owner can make a task private
        if (task.owner !== Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        Tasks.update(taskId, {
            $set: {
                private: setToPrivate
            }
        });
    },
    'tasks.setPriority' (taskId, priority) {
        check(taskId, String);
        //check(priority, number);

        const task = Tasks.findOne(taskId);

        // Make sure only the task owner can make a task private
        if (task.owner !== Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        Tasks.update(taskId, {
            $set: {
                priority: priority
            }
        });


        console.log(Session);
    },
    'tasks.upsertTag' (taskId, tag){
        task = Tasks.findOne(taskId);
        if (typeof task.tags != 'undefined'){
          task.tags.push(tag);
          Tasks.upsert({_id:taskId}, task);
        } else {
          task.tags = [tag];
          Tasks.upsert({_id:taskId}, task);
        }

        console.log(task);
    },
    'tasks.removeTag' (taskId, tag){
        task = Tasks.findOne(taskId);
        if (typeof task != 'undefined'){
          task.tags.pop(tag);
          Tasks.upsert({_id:taskId}, task);
        } else {
          console.log('assert fail remove tag', taskId, tag);
        }

        console.log(task);
    }

});
