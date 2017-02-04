# MySQL script to create database for Canvas Data schema version 1.13.3
SET default_storage_engine=InnoDB;
SET GLOBAL innodb_file_per_table=1;
DROP DATABASE IF EXISTS canvas_data;
CREATE DATABASE IF NOT EXISTS canvas_data DEFAULT CHARACTER SET utf8mb4;
USE canvas_data;
SET NAMES utf8mb4;
DROP TABLE IF EXISTS course_dim;
CREATE TABLE IF NOT EXISTS course_dim (
  `id` BIGINT COMMENT 'Unique surrogate id for a course',
  `canvas_id` BIGINT COMMENT 'Primary key for this course in the canvas courses table.',
  `root_account_id` BIGINT COMMENT 'The root account associated with this course.',
  `account_id` BIGINT COMMENT 'The parent account for this course.',
  `enrollment_term_id` BIGINT COMMENT 'Foreign key to enrollment term table',
  `name` VARCHAR(256) COMMENT 'The friendly name of the course.',
  `code` VARCHAR(256) COMMENT 'The code for the course (e.g. FA12 MATH 2000)',
  `type` VARCHAR(256) COMMENT 'deprecated. No longer used, will always be NULL.',
  `created_at` DATETIME COMMENT 'Timestamp when the course object was created in Canvas',
  `start_at` DATETIME COMMENT 'Timestamp for when the course starts.',
  `conclude_at` DATETIME COMMENT 'Timestamp for when the course finishes',
  `publicly_visible` BOOLEAN COMMENT 'True if the course is publicly visible',
  `sis_source_id` VARCHAR(256) COMMENT 'Correlated id for the record for this course in the SIS system (assuming SIS integration is configured)',
  `workflow_state` VARCHAR(256) COMMENT 'Workflow status indicating the current state of the course, valid values are: completed (course has been hard concluded), created (course has been created, but not published), deleted (course has been deleted), available (course is published, and not hard concluded), claimed (course has been undeleted, and is not published).',
  `wiki_id` BIGINT COMMENT 'Foreign key to the wiki_dim table.',
UNIQUE KEY id (id)
) COMMENT = "A course in the canvas system";
DROP TABLE IF EXISTS account_dim;
CREATE TABLE IF NOT EXISTS account_dim (
  `id` BIGINT COMMENT 'Unique surrogate id for an account',
  `canvas_id` BIGINT COMMENT 'Primary key for this entry in the Canvas accounts table',
  `name` VARCHAR(256) COMMENT 'Name of the account',
  `depth` INTEGER UNSIGNED COMMENT 'Depth of the account in the hierarchy. The root node is at 0.',
  `workflow_state` VARCHAR(256) COMMENT 'Workflow status indicating that account is [deleted] or [active]',
  `parent_account` VARCHAR(256) COMMENT 'Name of this account\'s parent account. This field will be NULL for the root account.',
  `parent_account_id` BIGINT COMMENT 'Id of this account\'s parent account. This field will be NULL for the root account.',
  `grandparent_account` VARCHAR(256) COMMENT 'Name of this account\'s grand parent account. This field will be NULL for the root account and all accounts at level 1.',
  `grandparent_account_id` BIGINT COMMENT 'Id of this account\'s grand parent account. This field will be NULL for the root account and all subaccounts at level 1.',
  `root_account` VARCHAR(256) COMMENT 'Name of the root account associated with this account.',
  `root_account_id` BIGINT COMMENT 'Id of the root account associated with this account.',
  `subaccount1` VARCHAR(256) COMMENT 'Name of this account\'s parent at subaccount level 1. If this account is a level 1 account, this will be the name of this account.',
  `subaccount1_id` BIGINT COMMENT 'Id of this account\'s parent at subaccount level 1. If this account is a level 1 account, this will be the id of this account.',
  `subaccount2` VARCHAR(256) COMMENT 'Name of this account\'s parent at subaccount level 2. If this account is a level 2 account, subaccount2 will be the name of this account.',
  `subaccount2_id` BIGINT COMMENT 'Id of this account\'s parent at subaccount level 2. If this account is a level 2 account, subaccount2_id will be the id of this account.',
  `subaccount3` VARCHAR(256) COMMENT 'Name of this account\'s parent at subaccount level 3. If this account is a level 3 account, subaccount3 will be the name of this account.',
  `subaccount3_id` BIGINT COMMENT 'Id of this account\'s parent at subaccount level 3. If this account is a level 3 account, subaccount3_id will be the id of this account.',
  `subaccount4` VARCHAR(256) COMMENT 'Name of this account\'s parent at subaccount level 4. If this account is a level 4 account, subaccount4 will be the name of this account.',
  `subaccount4_id` BIGINT COMMENT 'Id of this account\'s parent at subaccount level 4. If this account is a level 4 account, subaccount4_id will be the id of this account.',
  `subaccount5` VARCHAR(256) COMMENT 'Name of this account\'s parent at subaccount level 5. If this account is a level 5 account, subaccount5 will be the name of this account.',
  `subaccount5_id` BIGINT COMMENT 'Id of this account\'s parent at subaccount level 5. If this account is a level 5 account, subaccount5_id will be the id of this account.',
  `subaccount6` VARCHAR(256) COMMENT 'Name of this account\'s parent at subaccount level 6. If this account is a level 6 account, subaccount6 will be the name of this account.',
  `subaccount6_id` BIGINT COMMENT 'Id of this account\'s parent at subaccount level 6. If this account is a level 6 account, subaccount6_id will be the id of this account.',
  `subaccount7` VARCHAR(256) COMMENT 'Name of this account\'s parent at subaccount level 7. If this account is a level 7 account, subaccount7 will be the name of this account.',
  `subaccount7_id` BIGINT COMMENT 'Id of this account\'s parent at subaccount level 7. If this account is a level 7 account, subaccount7_id will be the id of this account.',
  `subaccount8` VARCHAR(256) COMMENT 'Name of this account\'s parent at subaccount level 8. If this account is a level 8 account, subaccount8 will be the name of this account.',
  `subaccount8_id` BIGINT COMMENT 'Id of this account\'s parent at subaccount level 8. If this account is a level 8 account, subaccount8_id will be the id of this account.',
  `subaccount9` VARCHAR(256) COMMENT 'Name of this account\'s parent at subaccount level 9. If this account is a level 9 account, subaccount9 will be the name of this account.',
  `subaccount9_id` BIGINT COMMENT 'Id of this account\'s parent at subaccount level 9. If this account is a level 9 account, subaccount9_id will be the id of this account.',
  `subaccount10` VARCHAR(256) COMMENT 'Name of this account\'s parent at subaccount level 10. If this account is a level 10 account, subaccount10 will be the name of this account.',
  `subaccount10_id` BIGINT COMMENT 'Id of this account\'s parent at subaccount level 10. If this account is a level 10 account, subaccount10_id will be the id of this account.',
  `subaccount11` VARCHAR(256) COMMENT 'Name of this account\'s parent at subaccount level 11. If this account is a level 11 account, subaccount11 will be the name of this account.',
  `subaccount11_id` BIGINT COMMENT 'Id of this account\'s parent at subaccount level 11. If this account is a level 11 account, subaccount11_id will be the id of this account.',
  `subaccount12` VARCHAR(256) COMMENT 'Name of this account\'s parent at subaccount level 12. If this account is a level 12 account, subaccount12 will be the name of this account.',
  `subaccount12_id` BIGINT COMMENT 'Id of this account\'s parent at subaccount level 12. If this account is a level 12 account, subaccount12_id will be the id of this account.',
  `subaccount13` VARCHAR(256) COMMENT 'Name of this account\'s parent at subaccount level 13. If this account is a level 13 account, subaccount13 will be the name of this account.',
  `subaccount13_id` BIGINT COMMENT 'Id of this account\'s parent at subaccount level 13. If this account is a level 13 account, subaccount13_id will be the id of this account.',
  `subaccount14` VARCHAR(256) COMMENT 'Name of this account\'s parent at subaccount level 14. If this account is a level 14 account, subaccount14 will be the name of this account.',
  `subaccount14_id` BIGINT COMMENT 'Id of this account\'s parent at subaccount level 14. If this account is a level 14 account, subaccount14_id will be the id of this account.',
  `subaccount15` VARCHAR(256) COMMENT 'Name of this account\'s parent at subaccount level 15. If this account is a level 15 account, subaccount15 will be the name of this account.',
  `subaccount15_id` BIGINT COMMENT 'Id of this account\'s parent at subaccount level 15. If this account is a level 15 account, subaccount15_id will be the id of this account.',
  `sis_source_id` VARCHAR(256) COMMENT 'Correlated id for the record for this course in the SIS system (assuming SIS integration is configured)',
UNIQUE KEY id (id)
) COMMENT = "An account object in the Canvas system. Accounts are most often used to represent a hierarchy of colleges, schools, departments, campuses, etc.";
DROP TABLE IF EXISTS user_dim;
CREATE TABLE IF NOT EXISTS user_dim (
  `id` BIGINT COMMENT 'Unique surrogate id for the user.',
  `canvas_id` BIGINT COMMENT 'Primary key for this user in the Canvas users table.',
  `root_account_id` BIGINT COMMENT 'Root account associated with this user.',
  `name` VARCHAR(256) COMMENT 'Name of the user',
  `time_zone` VARCHAR(256) COMMENT 'User\'s primary timezone',
  `created_at` DATETIME COMMENT 'Timestamp when the user was created in the Canvas system',
  `visibility` VARCHAR(256) COMMENT '(Deprecated) No longer used in Canvas.',
  `school_name` VARCHAR(256) COMMENT 'Used in Trial Versions of Canvas, the school the user is associated with',
  `school_position` VARCHAR(256) COMMENT 'Used in Trial Versions of Canvas, the position the user has at the school. E.g. Admin',
  `gender` VARCHAR(256) COMMENT 'The user\'s gender. This is an optional field and may not be entered by the user.',
  `locale` VARCHAR(256) COMMENT 'The user\'s locale. This is an optional field and may not be entered by the user.',
  `public` VARCHAR(256) COMMENT 'Used in Trial Versions of Canvas, the type of school the user is associated with',
  `birthdate` DATETIME COMMENT 'The user\'s birth date. This is an optional field and may not be entered by the user.',
  `country_code` VARCHAR(256) COMMENT 'The user\'s country code. This is an optional field and may not be entered by the user.',
  `workflow_state` VARCHAR(256) COMMENT 'Workflow status indicating the status of the user, valid values are: creation_pending, deleted, pre_registered, registered',
  `sortable_name` VARCHAR(256) COMMENT 'Name of the user that is should be used for sorting groups of users, such as in the gradebook.',
UNIQUE KEY id (id)
) COMMENT = "Attributes for users";
DROP TABLE IF EXISTS pseudonym_dim;
CREATE TABLE IF NOT EXISTS pseudonym_dim (
  `id` BIGINT COMMENT 'Unique surrogate id for the pseudonym.',
  `canvas_id` BIGINT COMMENT 'Primary key for this pseudonym in the the Canvas database',
  `user_id` BIGINT COMMENT 'Id for the user associated with this pseudonym',
  `account_id` BIGINT COMMENT 'Id for the account associated with this pseudonym',
  `workflow_state` VARCHAR(256) COMMENT 'Workflow status indicating that pseudonym is [deleted] or [active]',
  `last_request_at` DATETIME COMMENT 'Timestamp of when the user last logged in with this pseudonym',
  `last_login_at` DATETIME COMMENT 'Timestamp of last time a user logged in with this pseudonym',
  `current_login_at` DATETIME COMMENT 'Timestamp of when the user logged in',
  `last_login_ip` VARCHAR(256) COMMENT 'IP address recorded the last time a user logged in with this pseudonym',
  `current_login_ip` VARCHAR(256) COMMENT 'IP address of user\'s current/last login',
  `position` INTEGER UNSIGNED COMMENT 'Position of user\'s login credentials',
  `created_at` DATETIME COMMENT 'Timestamp when this pseudonym was created in Canvas',
  `updated_at` DATETIME COMMENT 'Timestamp when this pseudonym was last updated in Canvas',
  `password_auto_generated` BOOLEAN COMMENT 'True if the password has been auto-generated',
  `deleted_at` DATETIME COMMENT 'Timestamp when the pseudonym was deleted (NULL if the pseudonym is still active)',
  `sis_user_id` VARCHAR(256) COMMENT 'Correlated id for the record for this course in the SIS system (assuming SIS integration is configured)',
  `unique_name` VARCHAR(256) COMMENT 'Actual login id for a given pseudonym/account',
  `integration_id` VARCHAR(256) COMMENT 'A secondary unique identifier useful for more complex SIS integrations. This identifier must not change for the user, and must be globally unique.',
  `authentication_provider_id` BIGINT COMMENT 'The authentication provider this login is associated with. This can be the integer ID of the provider, or the type of the provider (in which case, it will find the first matching provider.)',
UNIQUE KEY id (id)
) COMMENT = "Pseudonyms are logins associated with users.";
DROP TABLE IF EXISTS pseudonym_fact;
CREATE TABLE IF NOT EXISTS pseudonym_fact (
  `pseudonym_id` BIGINT COMMENT 'Foreign key to pseudonym dimension table',
  `user_id` BIGINT COMMENT 'Foreign key to user associated with this pseudonym',
  `account_id` BIGINT COMMENT 'Foreign key to account associated with this pseudonym',
  `login_count` INTEGER UNSIGNED COMMENT 'Number of times a user has logged in with this pseudonym',
  `failed_login_count` INTEGER UNSIGNED COMMENT 'Number of times failed login attempt to this pseudonym'
);
DROP TABLE IF EXISTS assignment_dim;
CREATE TABLE IF NOT EXISTS assignment_dim (
  `id` BIGINT COMMENT 'Unique surrogate ID for the assignment.',
  `canvas_id` BIGINT COMMENT 'Primary key for this record in the Canvas assignments table.',
  `course_id` BIGINT COMMENT 'Foreign key to the course associated with this assignment',
  `title` VARCHAR(256) COMMENT 'Title of the assignment',
  `description` LONGTEXT COMMENT 'Long description of the assignment',
  `due_at` DATETIME COMMENT 'Timestamp for when the assignment is due',
  `unlock_at` DATETIME COMMENT 'Timestamp for when the assignment is unlocked or visible to the user',
  `lock_at` DATETIME COMMENT 'Timestamp for when the assignment is locked',
  `points_possible` DOUBLE COMMENT 'Total points possible for the assignment',
  `grading_type` VARCHAR(256) COMMENT 'Describes how the assignment will be graded (gpa_scale, pass_fail, percent, points, not_graded, letter_grade)',
  `submission_types` VARCHAR(256) COMMENT 'Comma separated list of valid methods for submitting the assignment (online_url, media_recording, online_upload, online_quiz, external_tool, online_text_entry, online_file_upload)',
  `workflow_state` VARCHAR(256) COMMENT 'Current workflow state of the assignment. Possible values are unpublished, published and deleted',
  `created_at` DATETIME COMMENT 'Timestamp of the first time the assignment was entered into the system',
  `updated_at` DATETIME COMMENT 'Timestamp of the last time the assignment was updated',
  `peer_review_count` INTEGER UNSIGNED COMMENT 'The number of pears to assign for review if using algorithmic assignment',
  `peer_reviews_due_at` DATETIME COMMENT 'Timestamp for when peer reviews should be completed',
  `peer_reviews_assigned` BOOLEAN COMMENT 'True if all peer reviews have been assigned',
  `peer_reviews` BOOLEAN COMMENT 'True if peer reviews are enabled for this assignment',
  `automatic_peer_reviews` BOOLEAN COMMENT 'True if peer reviews are assigned algorithmically (vs. letting the instructor make manual assignments)',
  `all_day` BOOLEAN COMMENT 'True if A specific time for when the assignment is due was not given. The effective due time will be 11:59pm.',
  `all_day_date` DATE COMMENT 'The date version of the due date if the all_day flag is true.',
  `could_be_locked` BOOLEAN COMMENT 'True if the assignment is under a module that can be locked',
  `grade_group_students_individually` BOOLEAN COMMENT 'True if students who submit work as a group will each receive individual grades (vs one grade that is copied to all group members)',
  `anonymous_peer_reviews` BOOLEAN COMMENT '(currently unimplemented, do not use)',
  `muted` BOOLEAN COMMENT 'Student cannot see grades left on the assignment.',
  `assignment_group_id` BIGINT COMMENT 'Foreign key to the assignment group dimension table.',
  `position` INTEGER UNSIGNED COMMENT 'The sorting order of the assignment in the group',
UNIQUE KEY id (id)
) COMMENT = "Attributes for for assignments. There is one record in this table for each assignment. Individual submissions of the assignment are in the submission_dim and submission_fact tables.";
DROP TABLE IF EXISTS assignment_fact;
CREATE TABLE IF NOT EXISTS assignment_fact (
  `assignment_id` BIGINT COMMENT 'Foreign key to assignment dimension',
  `course_id` BIGINT COMMENT 'Foreign key to the course associated with this assignment',
  `course_account_id` BIGINT COMMENT 'Foreign key to the account associated with the course associated with this assignment',
  `enrollment_term_id` BIGINT COMMENT 'Foreign Key to enrollment term table',
  `points_possible` DOUBLE COMMENT 'Total points possible for the assignment',
  `peer_review_count` INTEGER UNSIGNED COMMENT 'The number of pears to assign for review if using algorithmic assignment',
  `assignment_group_id` BIGINT COMMENT 'Foreign key to the assignment group dimension table.'
) COMMENT = "Table contains measures related to assignments.";
DROP TABLE IF EXISTS assignment_rule_dim;
CREATE TABLE IF NOT EXISTS assignment_rule_dim (
  `assignment_id` BIGINT COMMENT 'ID of the assignment which can never be dropped from the group.',
  `drop_rule` VARCHAR(256) COMMENT 'Denotes if the assignment can be dropped from the assignment group if the group allows dropping assignments based on certain rules. Is set to \'never_drop\' if the assignment is exempted from dropping, else set to \'can_be_dropped\'.'
) COMMENT = "Rules associated with an assignment.";
DROP TABLE IF EXISTS submission_dim;
CREATE TABLE IF NOT EXISTS submission_dim (
  `id` BIGINT COMMENT 'Unique surrogate ID for the submission.',
  `canvas_id` BIGINT COMMENT 'Primary key of this record in the Canvas submissions table.',
  `body` LONGTEXT COMMENT 'Text content for the submission.',
  `url` VARCHAR(256) COMMENT 'URL content for the submission.',
  `grade` VARCHAR(256) COMMENT 'Letter grade mapped from the score by the grading scheme.',
  `submitted_at` DATETIME COMMENT 'Timestamp of when the submission was submitted.',
  `submission_type` ENUM('discussion_topic', 'external_tool', 'media_recording', 'online_file_upload', 'online_quiz', 'online_text_entry', 'online_upload', 'online_url') COMMENT 'Type of submission.',
  `workflow_state` ENUM('graded', 'pending_review', 'submitted', 'unsubmitted') COMMENT 'Workflow state for submission lifetime values.',
  `created_at` DATETIME COMMENT 'Timestamp of when the submission was created.',
  `updated_at` DATETIME COMMENT 'Timestamp of when the submission was last updated.',
  `processed` BOOLEAN COMMENT 'Valid only when there is a file/attachment associated with the submission. By default, this attribute is set to \'false\' when making the assignment submission. When a submission has a file/attachment associated with it, upon submitting the assignment a snapshot is saved and its\' value is set to \'true\'. Defaults to \'NULL\'.',
  `process_attempts` INTEGER UNSIGNED COMMENT '(Deprecated) No longer used in Canvas.',
  `grade_matches_current_submission` BOOLEAN COMMENT 'Valid only when a score has been assigned to a submission. This is set to \'false\' if a student makes a new submission to an already graded assignment. This is done to indicate that the current grade given by the teacher is not for the most recent submission by the student. It is set to \'true\' if a score has been given and there is no new submission. Defaults to \'NULL\'.',
  `published_grade` VARCHAR(256) COMMENT 'Valid only for a graded submission. The values are strings that reflect the grading type used. For example, a scoring method of \'points\' will show \'4\' if given a \'4\' out of \'5\', and a scoring method of \'letter grade\' will show \'B\' for the same score (assuming a grading scale where 80-90% is a \'B\'). Defaults to \'NULL\'.',
  `graded_at` DATETIME COMMENT 'Timestamp of when the submission was graded.',
  `has_rubric_assessment` BOOLEAN COMMENT 'Valid only for a graded submission. Its\' value is set to \'true\' if the submission is associated with a rubric that has been assessed for at least one student, otherwise is set to \'false\'. Defaults to \'NULL\'.',
  `attempt` INTEGER UNSIGNED COMMENT 'The number of attempts made including this one.',
  `has_admin_comment` BOOLEAN COMMENT '(Deprecated) No longer used in Canvas.',
  `assignment_id` BIGINT COMMENT 'Foreign key to assignment dimension.',
  `excused` ENUM('excused_submission', 'regular_submission') COMMENT 'Denotes if this submission is excused or not.',
  `graded_anonymously` ENUM('graded_anonymously', 'not_graded_anonymously') COMMENT 'Denotes how the grading has been performed.',
  `grader_id` BIGINT COMMENT 'Foreign key to the user dimension of user who graded the assignment.',
  `group_id` BIGINT COMMENT 'Foreign key to the group_dim table.',
  `quiz_submission_id` BIGINT COMMENT 'Foreign key to the quiz_submission_dim table.',
  `user_id` BIGINT COMMENT 'Foreign key to the user_dim table.',
  `grade_state` ENUM('auto_graded', 'human_graded', 'not_graded') COMMENT 'Denotes the current state of the grade.',
UNIQUE KEY id (id)
) COMMENT = "This table records the latest submission for an assignment.";
DROP TABLE IF EXISTS submission_fact;
CREATE TABLE IF NOT EXISTS submission_fact (
  `submission_id` BIGINT COMMENT 'Foreign key to submission dimension',
  `assignment_id` BIGINT COMMENT 'Foreign key to assignment dimension',
  `course_id` BIGINT COMMENT 'Foreign key to course dimension of course associated with the assignment.',
  `enrollment_term_id` BIGINT COMMENT 'Foreign Key to enrollment term table',
  `user_id` BIGINT COMMENT 'Foreign key to user dimension of user who submitted the assignment.',
  `grader_id` BIGINT COMMENT 'Foreign key to the user dimension of user who graded the assignment.',
  `course_account_id` BIGINT COMMENT '(Deprecated) Foreign key to the account dimension of the account associated with the course associated with the assignment. Please use \'account_id\' instead.',
  `enrollment_rollup_id` BIGINT COMMENT 'Foreign key to the enrollment roll-up dimension table.',
  `score` DOUBLE COMMENT 'Numeric grade given to the submission.',
  `published_score` DOUBLE COMMENT 'Valid only for a graded submission. It reflects the numerical value of the actual score. Referring to our previous example for \'submission_dim.published_grade\', let\'s take two submissions, one for an assignment with a scoring method of \'points\' and the other for an assignment with a scoring method of \'letter grade\'. If the published grade is \'4\' out of \'5\' and \'B\' for them, respectively, then they should both have a score of \'4\' out of \'5\'. And their \'published_score\' values will be identical, \'4.0\'. Defaults to \'NULL\'.',
  `what_if_score` DOUBLE COMMENT 'Valid only if the student ever entered a \'What If\' score for an assignment in the Canvas UI. Only the most recent score entered by the student is stored here. Any time a new score is entered, the existing one is overwritten. Defaults to \'NULL\'.',
  `submission_comments_count` INTEGER UNSIGNED COMMENT 'Reflects the total number of comments on the submission by anyone/everyone, excluding comments that are flagged as \'hidden\'.',
  `account_id` BIGINT COMMENT 'Foreign key to the account the submission belongs to.',
  `assignment_group_id` BIGINT COMMENT 'Foreign key to the assignment group dimension table.',
  `group_id` BIGINT COMMENT 'Foreign key to the group_dim table.',
  `quiz_id` BIGINT COMMENT 'Foreign key to the quiz the quiz submission associated with this submission represents.',
  `quiz_submission_id` BIGINT COMMENT 'Foreign key to the quiz_submission_dim table.',
  `wiki_id` BIGINT COMMENT 'Foreign key to the wiki_dim table.'
);
DROP TABLE IF EXISTS submission_comment_participant_fact;
CREATE TABLE IF NOT EXISTS submission_comment_participant_fact (
  `submission_comment_participant_id` BIGINT COMMENT 'Foreign key to the submission comment participant dimension',
  `submission_comment_id` BIGINT COMMENT 'Foreign key to the submission comment dimension for the comment',
  `user_id` BIGINT COMMENT 'Foreign key to the user dimension of the user who made the comment',
  `submission_id` BIGINT COMMENT 'Foreign key to the submission dimension related to this participant\'s comment',
  `assignment_id` BIGINT COMMENT 'Foreign key to assignment dimension',
  `course_id` BIGINT COMMENT 'Foreign key to course dimension of course associated with the assignment.',
  `enrollment_term_id` BIGINT COMMENT 'Foreign Key to enrollment term table',
  `course_account_id` BIGINT COMMENT 'Foreign key to the account dimension of the account associated with the course associated with the assignment',
  `enrollment_rollup_id` BIGINT COMMENT 'Foreign key to the enrollment roll-up dimension table'
);
DROP TABLE IF EXISTS submission_comment_participant_dim;
CREATE TABLE IF NOT EXISTS submission_comment_participant_dim (
  `id` BIGINT,
  `canvas_id` BIGINT,
  `participation_type` VARCHAR(256),
  `created_at` DATETIME,
  `updated_at` DATETIME,
UNIQUE KEY id (id)
);
DROP TABLE IF EXISTS submission_comment_fact;
CREATE TABLE IF NOT EXISTS submission_comment_fact (
  `submission_comment_id` BIGINT COMMENT 'Foreign key to the submission comment dimension related to the comment',
  `submission_id` BIGINT COMMENT 'Foreign key to the submission dimension related to the comment',
  `recipient_id` BIGINT COMMENT '(Deprecated) No longer used in Canvas.',
  `author_id` BIGINT COMMENT 'Foreign key to the user dimension for the author of the comment',
  `assignment_id` BIGINT COMMENT 'Foreign key to assignment dimension',
  `course_id` BIGINT COMMENT 'Foreign key to course dimension of course associated with the assignment.',
  `enrollment_term_id` BIGINT COMMENT 'Foreign Key to enrollment term table',
  `course_account_id` BIGINT COMMENT 'Foreign key to the account dimension of the account associated with the course associated with the assignment',
  `message_size_bytes` INTEGER UNSIGNED COMMENT 'The message size in bytes.',
  `message_character_count` INTEGER UNSIGNED COMMENT 'The message size in characters.',
  `message_word_count` INTEGER UNSIGNED COMMENT 'The message size in words using space and common punctuation as word breaks.',
  `message_line_count` INTEGER UNSIGNED COMMENT 'The number of lines in a message.'
);
DROP TABLE IF EXISTS submission_comment_dim;
CREATE TABLE IF NOT EXISTS submission_comment_dim (
  `id` BIGINT,
  `canvas_id` BIGINT,
  `submission_id` BIGINT,
  `recipient_id` BIGINT COMMENT '(Deprecated) No longer used in Canvas.',
  `author_id` BIGINT,
  `assessment_request_id` BIGINT,
  `group_comment_id` VARCHAR(256),
  `comment` LONGTEXT,
  `author_name` VARCHAR(256),
  `created_at` DATETIME,
  `updated_at` DATETIME,
  `anonymous` BOOLEAN,
  `teacher_only_comment` BOOLEAN,
  `hidden` BOOLEAN,
UNIQUE KEY id (id)
);
DROP TABLE IF EXISTS assignment_group_dim;
CREATE TABLE IF NOT EXISTS assignment_group_dim (
  `id` BIGINT COMMENT 'Unique surrogate ID for the assignment group.',
  `canvas_id` BIGINT COMMENT 'Primary key for this record in the Canvas assignment_groups table.',
  `course_id` BIGINT COMMENT 'Foreign key to the course to which the assignment group belongs to.',
  `name` VARCHAR(256) COMMENT 'Name of the assignment group. Defaults to \'Assignments\' if no name is provided during group creation.',
  `default_assignment_name` VARCHAR(256) COMMENT 'Default name assigned to the assignments in the assignment group if no name is assigned to them during their creation. Also, it is the singularized version of the assignment group name by default (if it\'s in English).',
  `workflow_state` VARCHAR(256) COMMENT 'Current workflow state of the assignment groups. Possible values are \'available\' and \'deleted\'.',
  `position` INTEGER UNSIGNED COMMENT 'Position of the assignment group in the assignment index page. It determines where it should be displayed on the page and where it should be displayed in a new course if the course is cloned.',
  `created_at` DATETIME COMMENT 'Date/Time when the assignment group was created.',
  `updated_at` DATETIME COMMENT 'Date/Time when the assignment group was last updated.',
UNIQUE KEY id (id)
) COMMENT = "Attributes for assignment_groups.";
DROP TABLE IF EXISTS assignment_group_fact;
CREATE TABLE IF NOT EXISTS assignment_group_fact (
  `assignment_group_id` BIGINT COMMENT 'Foreign key to the assignment group dimension table.',
  `course_id` BIGINT COMMENT 'Foreign key to the course to which the assignment group belongs to.',
  `group_weight` DOUBLE COMMENT 'Weight of the assignment group. Reflects the value populated in the \'% of total grade\' field in Canvas while creating the assignment group.'
) COMMENT = "Measures for assignment_groups.";
DROP TABLE IF EXISTS assignment_group_rule_dim;
CREATE TABLE IF NOT EXISTS assignment_group_rule_dim (
  `assignment_group_id` BIGINT COMMENT 'Foreign key to the assignment group dimension table.',
  `drop_lowest` INTEGER UNSIGNED COMMENT 'Number of lowest scored assignments which can be dropped from the group. Set to \'0\' when none should be dropped. Defauts to \'0\'.',
  `drop_highest` INTEGER UNSIGNED COMMENT 'Number of highest scored assignments which can be dropped form the group. Set to \'0\' when none should be dropped. Defaults to \'0\'.'
) COMMENT = "Rules associated with an assignment group.";
DROP TABLE IF EXISTS assignment_override_user_dim;
CREATE TABLE IF NOT EXISTS assignment_override_user_dim (
  `id` BIGINT COMMENT 'Unique surrogate ID for the assignment_override_student.',
  `canvas_id` BIGINT COMMENT 'The ID of the user in the adhoc group table.',
  `assignment_id` BIGINT COMMENT 'Foreign key to the assignment the override is associated with. May be empty.',
  `assignment_override_id` BIGINT COMMENT 'Foreign key to the assignment override dimension',
  `quiz_id` BIGINT COMMENT 'Foreign key to the quiz the override is associated with. May be empty.',
  `user_id` BIGINT COMMENT 'Foreign key to the user.',
  `created_at` DATETIME COMMENT 'Timestamp of when the assignment_override_student was created.',
  `updated_at` DATETIME COMMENT 'Timestamp of when the assignment_override_student was last updated.',
UNIQUE KEY id (id)
) COMMENT = "Table contains measures related to adhoc users for whom an assignment override exists.";
DROP TABLE IF EXISTS assignment_override_user_fact;
CREATE TABLE IF NOT EXISTS assignment_override_user_fact (
  `assignment_override_user_id` BIGINT COMMENT 'Unique surrogate ID for the assignment_override_student. Is made up by adding a large number to the ID of the source table.',
  `account_id` BIGINT COMMENT 'Foreign key to the account associated with the course associated with this assignment.',
  `assignment_group_id` BIGINT COMMENT 'Foreign key to the assignment group dimension this fact is related to',
  `assignment_id` BIGINT COMMENT 'Foreign key to the assignment the override is associated with. May be empty.',
  `assignment_override_id` BIGINT COMMENT 'Foreign key to the assignment override dimension this fact is related to',
  `course_id` BIGINT COMMENT 'Foreign key to the course associated with this assignment.',
  `enrollment_term_id` BIGINT COMMENT 'Foreign Key to enrollment term table.',
  `quiz_id` BIGINT COMMENT 'Foreign key to the quiz the override is associated with. May be empty.',
  `user_id` BIGINT COMMENT 'Foreign key to the user.'
) COMMENT = "Table contains measures related to students for whom an assignment override exists.";
DROP TABLE IF EXISTS assignment_override_dim;
CREATE TABLE IF NOT EXISTS assignment_override_dim (
  `id` BIGINT COMMENT 'Unique surrogate ID for the assignment override.',
  `canvas_id` BIGINT COMMENT 'Primary key for this record in the Canvas assignments table.',
  `assignment_id` BIGINT COMMENT 'Foreign key to the assignment the override is associated with. May be empty.',
  `course_section_id` BIGINT COMMENT 'Foreign key to the course_section.',
  `group_id` BIGINT COMMENT 'Foreign key to the group.',
  `quiz_id` BIGINT COMMENT 'Foreign key to the quiz the override is associated with.',
  `all_day` ENUM('new_all_day', 'same_all_day') COMMENT 'Indicates if the all_day field overrides the original assignment.all_day field for this group of users.',
  `all_day_date` DATE COMMENT 'The new date version of the due date if the all_day flag is true.',
  `assignment_version` INTEGER UNSIGNED COMMENT 'The version of the assignment this override is applied too.',
  `created_at` DATETIME COMMENT 'Timestamp of when the assignment_override was created.',
  `due_at` DATETIME COMMENT 'The new due_at date-time for this group of users.',
  `due_at_overridden` ENUM('new_due_at', 'same_due_at') COMMENT 'Indicates if the due_at field overrides the original assignment.due_at field for this group of users.',
  `lock_at` DATETIME COMMENT 'The new lock_at date-time for this group of users.',
  `lock_at_overridden` ENUM('new_lock_at', 'same_lock_at') COMMENT 'Indicates if the lock_at field overrides the original assignment.lock_at field for this group of users.',
  `set_type` ENUM('course_section', 'group', 'adhoc') COMMENT 'Used in conjunction with set_id, this field tells us what type of foreign relation is used.',
  `title` LONGTEXT COMMENT 'The title for this assignment_override.',
  `unlock_at` DATETIME COMMENT 'The new unlock_at date-time for this group of users.',
  `unlock_at_overridden` ENUM('new_unlock_at', 'same_unlock_at') COMMENT 'Indicates if the unlock_at field overrides the original assignment.unlock_at field for this group of users.',
  `updated_at` DATETIME COMMENT 'Timestamp of when the assignment_override was last updated.',
  `quiz_version` INTEGER UNSIGNED COMMENT 'The version of the quiz this override is applied too.',
  `workflow_state` ENUM('active', 'deleted') COMMENT 'Gives the workflow state of this record.',
UNIQUE KEY id (id)
) COMMENT = "Attributes for assignment_override. There may be many records in this table for each assignment. Use the data in this table to calculate actual due, all_day, lock and unlock dates/times.";
DROP TABLE IF EXISTS assignment_override_fact;
CREATE TABLE IF NOT EXISTS assignment_override_fact (
  `assignment_override_id` BIGINT COMMENT 'Unique surrogate ID for the assignment_override.',
  `account_id` BIGINT COMMENT 'Foreign key to the account associated with the course associated with this assignment.',
  `assignment_id` BIGINT COMMENT 'Foreign key to the assignment the override is associated with. May be empty.',
  `assignment_group_id` BIGINT COMMENT 'Foreign key to the assignment group dimension table.',
  `course_id` BIGINT COMMENT 'Foreign key to the course associated with this assignment.',
  `course_section_id` BIGINT COMMENT 'Foreign key to the course_section.',
  `enrollment_term_id` BIGINT COMMENT 'Foreign Key to enrollment term table.',
  `group_id` BIGINT COMMENT 'Foreign key to the group.',
  `group_category_id` BIGINT COMMENT '(Not implemented) Foreign key to group category dimension table.',
  `group_parent_account_id` BIGINT COMMENT 'If the group is directly associated with an account, this is the id.',
  `nonxlist_course_id` BIGINT COMMENT 'The course ID for the original course if this course has been cross listed.',
  `quiz_id` BIGINT COMMENT 'Foreign key to the quiz the override is associated with. May be empty.',
  `group_wiki_id` BIGINT COMMENT 'Foreign key to the wiki_dim table.'
) COMMENT = "Table contains measures related to assignment overrides. Overrides can be found in the assignment_override_dim. Overrides are primarily the dates about the assigmnents for a given group of assignees.";
DROP TABLE IF EXISTS assignment_override_user_rollup_fact;
CREATE TABLE IF NOT EXISTS assignment_override_user_rollup_fact (
  `assignment_id` BIGINT COMMENT 'Foreign key to the assignment the override is associated with. May be empty.',
  `assignment_override_id` BIGINT COMMENT 'The ID of the assignment_override for this override user.',
  `assignment_override_user_adhoc_id` BIGINT COMMENT 'When not empty, this field is the ID of the user in the adhoc group table.',
  `assignment_group_id` BIGINT COMMENT 'Foreign key to the assignment group dimension table.',
  `course_id` BIGINT COMMENT 'Foreign key to the course associated with this assignment.',
  `course_account_id` BIGINT COMMENT 'Foreign key to the account associated with the course associated with this assignment.',
  `course_section_id` BIGINT COMMENT 'When not empty, this field is the ID of the course_section the user is part of.',
  `enrollment_id` BIGINT COMMENT 'When not empty, this field is the ID of the enrollment for a course section.',
  `enrollment_term_id` BIGINT COMMENT 'Foreign Key to enrollment term table.',
  `group_category_id` BIGINT COMMENT 'When not empty, this field is the ID of the group category the user is part of.',
  `group_id` BIGINT COMMENT 'When not empty, this field is the ID of the group the user is part of.',
  `group_parent_account_id` BIGINT COMMENT 'If the group is directly associated with an account, this is the id.',
  `group_wiki_id` BIGINT COMMENT 'Foreign key to the wiki_dim table.',
  `nonxlist_course_id` BIGINT COMMENT 'The course ID for the original course if this course has been cross listed.',
  `quiz_id` BIGINT COMMENT 'Foreign key to the quiz the override is associated with. May be empty.',
  `user_id` BIGINT COMMENT 'Foreign key to the user.'
) COMMENT = "Table contains measures related to students for whom an assignment override exists. This table contains the user ids of users for whom an override was created. There are 3 ways a user can be included, via an adhoc form, via a group membership, or a course section. All three are included here.";
DROP TABLE IF EXISTS communication_channel_dim;
CREATE TABLE IF NOT EXISTS communication_channel_dim (
  `id` BIGINT COMMENT 'Unique surrogate ID for the communication channel.',
  `canvas_id` BIGINT COMMENT 'Primary key for this communication channel in the communication_channel table.',
  `user_id` BIGINT COMMENT 'Foreign key to the user that owns this communication channel.',
  `address` VARCHAR(256) COMMENT 'Address, or path, of the communication channel. Set to \'NULL\' for push notifications.',
  `type` VARCHAR(256) COMMENT 'Denotes the type of the path. Possible values are \'email\', \'facebook\', \'push\' (device push notifications), \'sms\' and \'twitter\'. Defaults to \'email\'.',
  `position` INTEGER UNSIGNED COMMENT 'Position of this communication channel relative to the user\'s other channels when they are ordered.',
  `workflow_state` VARCHAR(256) COMMENT 'Current state of the communication channel. Possible values are \'unconfirmed\' and \'active\'.',
  `created_at` DATETIME COMMENT 'Date/Time when the quiz was created.',
  `updated_at` DATETIME COMMENT 'Date/Time when the quiz was last updated.',
UNIQUE KEY id (id)
) COMMENT = "Attributes for communication channel.";
DROP TABLE IF EXISTS communication_channel_fact;
CREATE TABLE IF NOT EXISTS communication_channel_fact (
  `communication_channel_id` BIGINT COMMENT 'Foreign key to the communication channel dimension table.',
  `user_id` BIGINT COMMENT 'Foreign key to the user that owns this communication channel.',
  `bounce_count` INTEGER UNSIGNED COMMENT 'Number of permanent bounces since the channel was last reset. If it\'s greater than 0, then no email is sent to the channel, until it is either reset by a siteadmin or it is removed and re-added by a user.'
) COMMENT = "Measures for communication channel.";
DROP TABLE IF EXISTS conversation_dim;
CREATE TABLE IF NOT EXISTS conversation_dim (
  `id` BIGINT COMMENT 'Unique surrogate id for the conversation.',
  `canvas_id` BIGINT COMMENT 'Original primary key for conversation in the Canvas table',
  `has_attachments` BOOLEAN COMMENT 'True if the conversation has attachments',
  `has_media_objects` BOOLEAN COMMENT 'True if the conversation has media objects',
  `subject` VARCHAR(256) COMMENT 'The subject of the conversation',
  `course_id` BIGINT COMMENT 'The course that owns this conversation',
  `group_id` BIGINT COMMENT 'The group that owns this conversation',
  `account_id` BIGINT COMMENT 'The account this owns this conversation',
UNIQUE KEY id (id)
) COMMENT = "Attributes for a conversation";
DROP TABLE IF EXISTS conversation_message_dim;
CREATE TABLE IF NOT EXISTS conversation_message_dim (
  `id` BIGINT COMMENT 'Unique surrogate id for the message.',
  `canvas_id` BIGINT COMMENT 'Original ID for canvas table.',
  `conversation_id` BIGINT COMMENT 'Parent conversation for this message.',
  `author_id` BIGINT COMMENT 'User id of the author of the message.',
  `created_at` DATETIME COMMENT 'Date and time this message was created.',
  `generated` BOOLEAN COMMENT 'This attribute is true if the system generated this message (e.g. \"John was added to this conversation\")',
  `has_attachments` BOOLEAN COMMENT 'True if the message has attachments.',
  `has_media_objects` BOOLEAN COMMENT 'True if the message has media objects.',
  `body` LONGTEXT COMMENT 'The content of the message.',
UNIQUE KEY id (id)
) COMMENT = "Attributes for a message in a conversation";
DROP TABLE IF EXISTS conversation_message_participant_fact;
CREATE TABLE IF NOT EXISTS conversation_message_participant_fact (
  `conversation_message_id` BIGINT COMMENT 'Foreign key to the message dimension for the associated message.',
  `conversation_id` BIGINT COMMENT 'Foreign key to the conversation dimension for the associated conversation',
  `user_id` BIGINT COMMENT 'Foreign key to the user dimension for the associated user',
  `course_id` BIGINT COMMENT 'Foreign key to the course dimension for the associated course.',
  `enrollment_term_id` BIGINT COMMENT 'Foreign Key to enrollment term table',
  `course_account_id` BIGINT COMMENT 'Foreign Key to the course\'s account',
  `group_id` BIGINT COMMENT 'Foreign key to the group dimension for a particular group',
  `account_id` BIGINT COMMENT 'Foreign key to account_dim',
  `enrollment_rollup_id` BIGINT COMMENT 'Foreign key to the enrollment roll-up dimension table',
  `message_size_bytes` INTEGER UNSIGNED COMMENT 'The message size in bytes.',
  `message_character_count` INTEGER UNSIGNED COMMENT 'The message size in characters.',
  `message_word_count` INTEGER UNSIGNED COMMENT 'The message size in words using space and common punctuation as word breaks.',
  `message_line_count` INTEGER UNSIGNED COMMENT 'The number of lines in a message.'
) COMMENT = "Fact table for each message in a conversation and each participant";
DROP TABLE IF EXISTS discussion_topic_dim;
CREATE TABLE IF NOT EXISTS discussion_topic_dim (
  `id` BIGINT COMMENT 'Unique surrogate id for the discussion topic.',
  `canvas_id` BIGINT COMMENT 'Primary key to the discussion_topics table in Canvas',
  `title` VARCHAR(256) COMMENT 'Title of the discussion topic',
  `message` LONGTEXT COMMENT 'Message text for the discussion topic.',
  `type` VARCHAR(256) COMMENT 'Discussion topic type. Two types are default (blank) and announcement.',
  `workflow_state` VARCHAR(256) COMMENT 'Workflow state for this discussion topic. Valid states are unpublished, active, locked, deleted, and post_delayed',
  `last_reply_at` DATETIME COMMENT 'Timestamp of the last reply to this topic.',
  `created_at` DATETIME COMMENT 'Timestamp when the discussion topic was first saved in the system.',
  `updated_at` DATETIME COMMENT 'Timestamp when the discussion topic was last updated in the system.',
  `delayed_post_at` DATETIME COMMENT 'Timestamp when the discussion topic was/will be delay-posted',
  `posted_at` DATETIME COMMENT 'Timestamp when the discussion topic was posted',
  `deleted_at` DATETIME COMMENT 'Timestamp when the discussion topic was deleted.',
  `discussion_type` VARCHAR(256) COMMENT 'Type of discussion topic: default(blank), side_comment, threaded. threaded indicates that replies are threaded where side_comment indicates that replies in the discussion are flat. See related Canvas Guide https://guides.instructure.com/m/4152/l/60423-how-do-i-create-a-threaded-discussion',
  `pinned` BOOLEAN COMMENT 'True if the discussion topic has been pinned',
  `locked` BOOLEAN COMMENT 'True if the discussion topic has been locked',
UNIQUE KEY id (id)
) COMMENT = "Attributes for discussion topics in Canvas. Discussion topics are logical discussion threads. They can have many discussion entries. They also have their own message text for the message that started the topic.";
DROP TABLE IF EXISTS discussion_topic_fact;
CREATE TABLE IF NOT EXISTS discussion_topic_fact (
  `discussion_topic_id` BIGINT COMMENT 'Foreign key to the discussion topic dimension for the associated discussion topic.',
  `course_id` BIGINT COMMENT 'Foreign key to the course dimension',
  `enrollment_term_id` BIGINT COMMENT 'Foreign Key to enrollment term table',
  `course_account_id` BIGINT COMMENT '(currently un-populated) Foreign key to the account dimension for the account associated with the associated course',
  `user_id` BIGINT COMMENT 'Foreign key to the user dimension for the user that created the discussion topic.',
  `assignment_id` BIGINT COMMENT 'Foreign key to the assignment dimension',
  `editor_id` BIGINT COMMENT 'Foreign key to the user to last edit the entry, if different than user_id',
  `enrollment_rollup_id` BIGINT COMMENT 'Foreign key to the enrollment roll-up dimension table',
  `message_length` INTEGER UNSIGNED COMMENT 'The length of the message in bytes.'
) COMMENT = "Measures for discussion topics/threads.";
DROP TABLE IF EXISTS discussion_entry_dim;
CREATE TABLE IF NOT EXISTS discussion_entry_dim (
  `id` BIGINT COMMENT 'Unique surrogate id for the discussion entry.',
  `canvas_id` BIGINT COMMENT 'Primary key for this record in the Canvas discussion_entries table',
  `message` LONGTEXT COMMENT 'Full text of the entry\'s message',
  `workflow_state` VARCHAR(256) COMMENT 'Workflow state for discussion message (values: deleted, active)',
  `created_at` DATETIME COMMENT 'Timestamp when the discussion entry was created.',
  `updated_at` DATETIME COMMENT 'Timestamp when the discussion entry was updated.',
  `deleted_at` DATETIME COMMENT 'Timestamp when the discussion entry was deleted.',
  `depth` INTEGER UNSIGNED COMMENT 'Reply depth for this entry',
UNIQUE KEY id (id)
) COMMENT = "Attributes for discussion entries. Discussion entries are replies in a discussion topic.";
DROP TABLE IF EXISTS discussion_entry_fact;
CREATE TABLE IF NOT EXISTS discussion_entry_fact (
  `discussion_entry_id` BIGINT COMMENT 'Foreign key to this entries attributes.',
  `parent_discussion_entry_id` BIGINT COMMENT 'Foreign key to the reply that it is nested underneath.',
  `user_id` BIGINT COMMENT 'Foreign key to the user that created this entry.',
  `topic_id` BIGINT COMMENT 'Foreign key to associated discussion topic.',
  `course_id` BIGINT COMMENT 'Foreign key to associated course.',
  `enrollment_term_id` BIGINT COMMENT 'Foreign Key to enrollment term table',
  `course_account_id` BIGINT COMMENT 'Foreign key to account for associated course.',
  `topic_user_id` BIGINT COMMENT 'Foreign key to user that posted the associated discussion topic.',
  `topic_assignment_id` BIGINT COMMENT 'Foreign key to assignment associated with the entry\'s discussion topic.',
  `topic_editor_id` BIGINT COMMENT 'Foreign key to editor associated with the entry\'s discussion topic.',
  `enrollment_rollup_id` BIGINT COMMENT 'Foreign key to the enrollment roll-up dimension table',
  `message_length` INTEGER UNSIGNED COMMENT 'Length of the message in bytes'
) COMMENT = "Measures for discussion entries. Discussion entries are replies in a discussion topic.";
DROP TABLE IF EXISTS enrollment_term_dim;
CREATE TABLE IF NOT EXISTS enrollment_term_dim (
  `id` BIGINT COMMENT 'Unique surrogate id for the enrollment term.',
  `canvas_id` BIGINT COMMENT 'Primary key for this record in the Canvas enrollments table.',
  `root_account_id` BIGINT COMMENT 'Foreign key to the root account for this enrollment term',
  `name` VARCHAR(256) COMMENT 'Name of the enrollment term',
  `date_start` DATETIME COMMENT 'Term start date',
  `date_end` DATETIME COMMENT 'Term end date',
  `sis_source_id` VARCHAR(256) COMMENT 'Correlated SIS id for this enrollment term (assuming SIS has been configured properly)',
UNIQUE KEY id (id)
) COMMENT = "Enrollment term describes the term or semester associated with courses (e.g. Fall 2013)";
DROP TABLE IF EXISTS course_section_dim;
CREATE TABLE IF NOT EXISTS course_section_dim (
  `id` BIGINT COMMENT 'Unique surrogate id for the course section.',
  `canvas_id` BIGINT COMMENT 'Primary key for this record in the Canvas course_sections table.',
  `name` VARCHAR(256) COMMENT 'Name of the section',
  `course_id` BIGINT COMMENT 'Foreign key to the associated course',
  `enrollment_term_id` BIGINT COMMENT 'Foreign key to the associated enrollment term',
  `default_section` BOOLEAN COMMENT 'True if this is the default section',
  `accepting_enrollments` BOOLEAN COMMENT 'True if this section is open for enrollment',
  `can_manually_enroll` BOOLEAN COMMENT 'Deprecated',
  `start_at` DATETIME COMMENT 'Section start date',
  `end_at` DATETIME COMMENT 'Section end date',
  `created_at` DATETIME COMMENT 'Timestamp for when this section was entered into the system.',
  `updated_at` DATETIME COMMENT 'Timestamp for when the last time the section was updated',
  `workflow_state` VARCHAR(256) COMMENT 'Life-cycle state for section. (active, deleted)',
  `restrict_enrollments_to_section_dates` BOOLEAN COMMENT 'True when \"Users can only participate in the course between these dates\" is checked',
  `nonxlist_course_id` BIGINT COMMENT 'The course id for the original course if this course has been cross listed',
  `sis_source_id` VARCHAR(256) COMMENT 'Id for the correlated record for the section in the SIS (assuming SIS integration has been properly configured)',
UNIQUE KEY id (id)
) COMMENT = "Attributes for a section of a course";
DROP TABLE IF EXISTS role_dim;
CREATE TABLE IF NOT EXISTS role_dim (
  `id` BIGINT COMMENT 'Unique surrogate id for the role.',
  `canvas_id` BIGINT COMMENT 'Primary key for this record in the Canvas roles table',
  `root_account_id` BIGINT COMMENT 'Foreign key to the account dimension for this role\'s root account.',
  `account_id` BIGINT COMMENT 'The foreign key to the account that is in the role',
  `name` VARCHAR(256) COMMENT 'The name of role, previously was \"role_name\" on the enrollments_dim',
  `base_role_type` VARCHAR(256) COMMENT 'The built in type this role is based on.',
  `workflow_state` VARCHAR(256) COMMENT 'Workflow status indicating that the role is [deleted] or [inactive]',
  `created_at` DATETIME COMMENT 'Timestamp of the first time the role was entered into the system',
  `updated_at` DATETIME COMMENT 'Timestamp of the last time the role was updated',
  `deleted_at` DATETIME COMMENT 'Timestamp of when the role was removed from the system',
UNIQUE KEY id (id)
) COMMENT = "Give the possible roles for an enrolled user";
DROP TABLE IF EXISTS enrollment_dim;
CREATE TABLE IF NOT EXISTS enrollment_dim (
  `id` BIGINT COMMENT 'Unique surrogate id for the enrollment.',
  `canvas_id` BIGINT COMMENT 'Primary key for this record in the Canvas enrollments table',
  `root_account_id` BIGINT COMMENT 'Root account id associated with this enrollment',
  `course_section_id` BIGINT COMMENT 'Foreign key to the course section for this enrollment',
  `role_id` BIGINT COMMENT 'Foreign key to the role of the person enrolled in the course',
  `type` VARCHAR(256) COMMENT 'Enrollment type: TaEnrollment, DesignerEnrollment, StudentEnrollment, TeacherEnrollment, StudentViewEnrollment, ObserverEnrollment',
  `workflow_state` VARCHAR(256) COMMENT 'Workflow state for enrollment: active, completed, rejected, deleted, invited, creation_pending',
  `created_at` DATETIME COMMENT 'Timestamp for when this section was entered into the system.',
  `updated_at` DATETIME COMMENT 'Timestamp for when the last time the section was updated',
  `start_at` DATETIME COMMENT 'Enrollment start date',
  `end_at` DATETIME COMMENT 'Enrollment end date',
  `completed_at` DATETIME COMMENT 'Enrollment completed date',
  `self_enrolled` BOOLEAN COMMENT 'Enrollment was created via self-enrollment',
  `sis_source_id` VARCHAR(256) COMMENT '(Deprecated) No longer used in Canvas.',
  `course_id` BIGINT COMMENT 'Foreign key to course for this enrollment',
  `user_id` BIGINT COMMENT 'Foreign key to user for the enrollment',
UNIQUE KEY id (id)
) COMMENT = "An enrollment represents a user\'s association with a specific course and section";
DROP TABLE IF EXISTS enrollment_fact;
CREATE TABLE IF NOT EXISTS enrollment_fact (
  `enrollment_id` BIGINT COMMENT 'Foreign key for the attributes of the enrollment',
  `user_id` BIGINT COMMENT 'Foreign key to the enrolled user',
  `course_id` BIGINT COMMENT 'Foreign key to the enrolled course',
  `enrollment_term_id` BIGINT COMMENT 'Foreign key to the enrollment term table',
  `course_account_id` BIGINT COMMENT 'Foreign key to the account of the enrolled course',
  `course_section_id` BIGINT COMMENT 'Foreign key to the enrolled section',
  `computed_final_score` DOUBLE COMMENT 'Final score for the enrollment',
  `computed_current_score` DOUBLE COMMENT 'Current score for the enrollment'
) COMMENT = "Measures for enrollments";
DROP TABLE IF EXISTS enrollment_rollup_dim;
CREATE TABLE IF NOT EXISTS enrollment_rollup_dim (
  `id` BIGINT COMMENT 'Unique surrogate id for the user and the course.',
  `user_id` BIGINT COMMENT 'Foreign key to the enrolled user.',
  `course_id` BIGINT COMMENT 'Foreign key to the enrolled course.',
  `enrollment_count` INTEGER UNSIGNED COMMENT 'Total number of enrollments associated with the user in the course for his/her all roles under all base roles, duplicate or not.',
  `role_count` INTEGER UNSIGNED COMMENT 'Total number of unique roles associated with the user in the course.',
  `base_role_count` INTEGER UNSIGNED COMMENT 'Total number of unique base roles associated with the user in the course.',
  `account_admin_role_count` INTEGER UNSIGNED COMMENT 'Total number of \'AccountAdmin\' roles associated with the user in the course.',
  `teacher_enrollment_role_count` INTEGER UNSIGNED COMMENT 'Total number of \'TeacherEnrollment\' roles associated with the user in the course.',
  `designer_enrollment_role_count` INTEGER UNSIGNED COMMENT 'Total number of \'DesignerEnrollment\' roles associated with the user in the course.',
  `ta_enrollment_role_count` INTEGER UNSIGNED COMMENT 'Total number of \'TaEnrollment\' roles associated with the user in the course.',
  `student_enrollment_role_count` INTEGER UNSIGNED COMMENT 'Total number of \'StudentEnrollment\' roles associated with the user in the course.',
  `observer_enrollment_role_count` INTEGER UNSIGNED COMMENT 'Total number of \'ObserverEnrollment\' roles associated with the user in the course.',
  `account_membership_role_count` INTEGER UNSIGNED COMMENT 'Total number of \'AccountMembership\' roles associated with the user in the course.',
  `no_permissions_role_count` INTEGER UNSIGNED COMMENT 'Total number of \'NoPermissions\' roles associated with the user in the course.',
  `account_admin_enrollment_id` BIGINT COMMENT 'Enrollment ID if this a valid role for the user in the course, else NULL.',
  `teacher_enrollment_enrollment_id` BIGINT COMMENT 'Enrollment ID if this a valid role for the user in the course, else NULL.',
  `designer_enrollment_enrollment_id` BIGINT COMMENT 'Enrollment ID if this a valid role for the user in the course, else NULL.',
  `ta_enrollment_enrollment_id` BIGINT COMMENT 'Enrollment ID if this a valid role for the user in the course, else NULL.',
  `student_enrollment_enrollment_id` BIGINT COMMENT 'Enrollment ID if this a valid role for the user in the course, else NULL.',
  `observer_enrollment_enrollment_id` BIGINT COMMENT 'Enrollment ID if this a valid role for the user in the course, else NULL.',
  `account_membership_enrollment_id` BIGINT COMMENT 'Enrollment ID if this a valid role for the user in the course, else NULL.',
  `no_permissions_enrollment_id` BIGINT COMMENT 'Enrollment ID if this a valid role for the user in the course, else NULL.',
  `most_privileged_role` VARCHAR(256) COMMENT 'The most privileged role associated with the user in the course.',
  `least_privileged_role` VARCHAR(256) COMMENT 'The least privileged role associated with the user in the course.',
UNIQUE KEY id (id)
) COMMENT = "Would be an empty table. Roll-up aggregating the roles held by the users in the courses they are associated with.";
DROP TABLE IF EXISTS file_dim;
CREATE TABLE IF NOT EXISTS file_dim (
  `id` BIGINT COMMENT 'Unique surrogate ID for this file.',
  `canvas_id` BIGINT COMMENT 'Primary key for this file in the attachments table.',
  `display_name` LONGTEXT COMMENT 'Name of this file.',
  `account_id` BIGINT COMMENT 'Foreign key to the account this file belongs to.',
  `assignment_id` BIGINT COMMENT 'Foreign key to the assignment this file belongs to.',
  `conversation_message_id` BIGINT COMMENT 'Foreign key to the conversation message this file belongs to.',
  `course_id` BIGINT COMMENT 'Foreign key to the course this file belongs to.',
  `folder_id` BIGINT COMMENT 'Foreign key to the folder this file belongs to.',
  `group_id` BIGINT COMMENT 'Foreign key to the group this file belongs to.',
  `quiz_id` BIGINT COMMENT 'Foreign key to the quiz this file belongs to.',
  `quiz_submission_id` BIGINT COMMENT 'Foreign key to the quiz submission this file belongs to.',
  `replacement_file_id` BIGINT COMMENT 'ID of the overwriting file if this file is overwritten.',
  `root_file_id` BIGINT COMMENT 'ID of the source file from which this file was copied and created. Set to \'NULL\' when this is the only copy.',
  `submission_id` BIGINT COMMENT 'Foreign key to the submission this file belongs to.',
  `uploader_id` BIGINT COMMENT 'Foreign key to the user who uploaded this file. Might contain users which are not in the user dimension table.',
  `user_id` BIGINT COMMENT 'Foreign key to the user this file belongs to.',
  `owner_entity_type` ENUM('account', 'assignment', 'conversation_message', 'course', 'group', 'quiz', 'quiz_submission', 'submission', 'user') COMMENT 'Table this file is associated with.',
  `content_type` VARCHAR(256) COMMENT 'Contains the MIME type of this file.',
  `md5` VARCHAR(256) COMMENT 'Contains the MD5 checksum of the contents of this file.',
  `file_state` ENUM('available', 'broken', 'deleted', 'errored', 'hidden') COMMENT 'Denotes the current state of this file.',
  `could_be_locked` ENUM('allow_locking', 'disallow_locking') COMMENT 'Dictates if the quiz can be locked or not.',
  `locked` ENUM('is_locked', 'is_not_locked') COMMENT 'Denotes the current lock status of this file.',
  `lock_at` DATETIME COMMENT 'Date/Time when this file is to be locked.',
  `unlock_at` DATETIME COMMENT 'Date/Time when this file is to unlocked.',
  `viewed_at` DATETIME COMMENT 'Date/Time when this file was last viewed.',
  `created_at` DATETIME COMMENT 'Date/Time when this file was created.',
  `updated_at` DATETIME COMMENT 'Date/Time when this file was last updated.',
  `deleted_at` DATETIME COMMENT 'Date/Time when this file was deleted.',
UNIQUE KEY id (id)
) COMMENT = "Attributes for files.";
DROP TABLE IF EXISTS file_fact;
CREATE TABLE IF NOT EXISTS file_fact (
  `file_id` BIGINT COMMENT 'Foreign key to this file dimesion table.',
  `account_id` BIGINT COMMENT 'Foreign key to the account this file belongs to.',
  `assignment_id` BIGINT COMMENT 'Foreign key to the assignment, the quiz/quiz submission/submission associated with this file belongs to.',
  `assignment_group_id` BIGINT COMMENT 'Foreign key to the assignment group, the assignment/submission associated with this file belongs to.',
  `conversation_id` BIGINT COMMENT 'Foreign key to the conversation, the conversation message associated with this file belongs to.',
  `conversation_message_author_id` BIGINT COMMENT 'Foreign key to the user, who authored the conversation message this file belongs to.',
  `conversation_message_id` BIGINT COMMENT 'Foreign key to the conversation message this file belongs to.',
  `course_id` BIGINT COMMENT 'Foreign key to the course, the assignment/quiz/quiz submission/submission associated with this file belongs to.',
  `enrollment_rollup_id` BIGINT COMMENT 'Foreign key to the enrollment roll-up, the quiz submission/submission associated with this file belongs to.',
  `enrollment_term_id` BIGINT COMMENT 'Foreign Key to enrollment term, the assignment/conversation message/group/quiz/quiz submission/submission associated with this file belongs to.',
  `folder_id` BIGINT COMMENT 'Foreign key to the folder this file belongs to.',
  `grader_id` BIGINT COMMENT 'Foreign key to the user who graded the submission associated with this file.',
  `group_id` BIGINT COMMENT 'Foreign key to the group this file belongs to.',
  `group_category_id` BIGINT COMMENT '(Not implemented) Foreign key to group category the group associated with this file belongs to.',
  `quiz_id` BIGINT COMMENT 'Foreign key to the quiz, the quiz/quiz submission associated with this file belongs to.',
  `quiz_submission_id` BIGINT COMMENT 'Foreign key to the quiz submission this file belongs to.',
  `replacement_file_id` BIGINT COMMENT 'Foreign key to the file which overwrote/replaced this file. Defaults to \'NULL\' when the file was not overwritten/replaced.',
  `root_file_id` BIGINT COMMENT 'Foreign key to the source file from which this file was copied and created. Defaults to \'NULL\' when this is the only copy.',
  `sis_source_id` VARCHAR(256) COMMENT 'Correlated ID for the record for the course, associated with this file, in the SIS system (assuming SIS integration is configured).',
  `submission_id` BIGINT COMMENT 'Foreign key to the submission this file belongs to.',
  `uploader_id` BIGINT COMMENT 'Foreign key to the user who uploaded this file. Might contain users which are not in the user dimension table.',
  `user_id` BIGINT COMMENT 'Foreign key to the user this file belongs to.',
  `wiki_id` BIGINT COMMENT 'Foreign key to the wiki the conversation message/group/submission associated with this file belongs to.',
  `size` BIGINT COMMENT 'Size of this file in bytes.'
) COMMENT = "Measures for files.";
DROP TABLE IF EXISTS group_dim;
CREATE TABLE IF NOT EXISTS group_dim (
  `id` BIGINT COMMENT 'Unique surrogate id for the group.',
  `canvas_id` BIGINT COMMENT 'Primary key to the groups table in canvas.',
  `name` VARCHAR(256) COMMENT 'Name of the group.',
  `description` LONGTEXT COMMENT 'Description of the group.',
  `created_at` DATETIME COMMENT 'Timestamp when the group was first saved in the system.',
  `updated_at` DATETIME COMMENT 'Timestamp when the group was last updated in the system.',
  `deleted_at` DATETIME COMMENT 'Timestamp when the group was deleted.',
  `is_public` BOOLEAN COMMENT 'True if the group contents are accessible to public.',
  `workflow_state` VARCHAR(256) COMMENT 'Workflow state for group.(values: deleted,active)',
  `context_type` VARCHAR(256) COMMENT 'The context type to which the group belongs to. For example- Accounts, Courses etc.',
  `category` LONGTEXT COMMENT 'Group description by the users.',
  `join_level` VARCHAR(256) COMMENT 'Permissions required to join a group. For example, it can be invitation-only or auto.',
  `default_view` VARCHAR(256) COMMENT 'Default view for groups is the feed.',
  `sis_source_id` BIGINT COMMENT 'Correlated id for the record for this group in the SIS system (assuming SIS integration is configured)',
  `group_category_id` BIGINT COMMENT '(Not implemented) Foreign key to group category dimension table.',
  `account_id` BIGINT COMMENT 'Parent account for this group.',
  `wiki_id` BIGINT COMMENT 'Foreign key to the wiki_dim table.',
UNIQUE KEY id (id)
) COMMENT = "Attributes for groups in canvas. Groups contain two or more students enrolled in a particular course working on an assignment or project together.";
DROP TABLE IF EXISTS group_fact;
CREATE TABLE IF NOT EXISTS group_fact (
  `group_id` BIGINT COMMENT 'Foreign key to the group dimension for a particular group.',
  `parent_course_id` BIGINT COMMENT 'Foreign key to course dimension.',
  `parent_account_id` BIGINT COMMENT 'Foreign key to accounts table.',
  `parent_course_account_id` BIGINT COMMENT 'Foreign key to the account dimension for the account associated with the course to which the group belongs to.',
  `enrollment_term_id` BIGINT COMMENT 'Foreign key to the enrollment term table for the parent course.',
  `max_membership` INTEGER UNSIGNED COMMENT 'Maximum number of users that can be accommodated in a group.',
  `storage_quota` BIGINT COMMENT 'Storage Limit allowed per group.',
  `group_category_id` BIGINT COMMENT '(Not implemented) Foreign key to group category dimension table.',
  `account_id` BIGINT COMMENT 'Parent account for this group.',
  `wiki_id` BIGINT COMMENT 'Foreign key to the wiki_dim table.'
) COMMENT = "Measures for groups.";
DROP TABLE IF EXISTS group_membership_fact;
CREATE TABLE IF NOT EXISTS group_membership_fact (
  `group_id` BIGINT COMMENT 'Foreign key to the group dimension for a particular group.',
  `parent_course_id` BIGINT COMMENT 'Foreign key to course dimension.',
  `parent_account_id` BIGINT COMMENT 'Foreign key to accounts table.',
  `parent_course_account_id` BIGINT COMMENT 'Foreign key to the account dimension for the account associated with the course to which the group belongs to.',
  `enrollment_term_id` BIGINT COMMENT 'Foreign key to the enrollment term table for the parent course.',
  `user_id` BIGINT COMMENT 'Foreign key to the user dimension for the users in the group.',
  `group_membership_id` VARCHAR(256) COMMENT 'The ID of the membership object'
) COMMENT = "Measures for groups.";
DROP TABLE IF EXISTS group_membership_dim;
CREATE TABLE IF NOT EXISTS group_membership_dim (
  `id` VARCHAR(256) COMMENT 'The ID of the membership object',
  `canvas_id` VARCHAR(256) COMMENT 'The ID of the membership object as it appears in the db.',
  `group_id` BIGINT COMMENT 'Foreign key to the group dimension for a particular group.',
  `moderator` ENUM('is_moderator', 'not_moderator') COMMENT 'Whether or not the user is a moderator of the group.',
  `workflow_state` ENUM('accepted', 'invited', 'requested', 'deleted') COMMENT 'The current state of the membership. Current possible values are \'accepted\', \'invited\', \'requested\', and \'deleted\'',
  `created_at` DATETIME COMMENT 'Timestamp when the group membership was first saved in the system.',
  `updated_at` DATETIME COMMENT 'Timestamp when the group membership was last updated in the system.',
UNIQUE KEY id (id)
) COMMENT = "Attributes for groups_membership in canvas.";
DROP TABLE IF EXISTS course_ui_canvas_navigation_dim;
CREATE TABLE IF NOT EXISTS course_ui_canvas_navigation_dim (
  `id` BIGINT COMMENT 'Primary key for navigational item',
  `canvas_id` BIGINT COMMENT 'ID in Canvas system',
  `name` VARCHAR(256) COMMENT 'Name of navigational item',
  `default` VARCHAR(256) COMMENT '(Default|NotDefault) - set to Default if this is one of the navigation items enabled in a course by default',
  `original_position` VARCHAR(256) COMMENT 'Original position of this navigation item',
UNIQUE KEY id (id)
) COMMENT = "Attributes for a Canvas navigation function";
DROP TABLE IF EXISTS course_ui_navigation_item_dim;
CREATE TABLE IF NOT EXISTS course_ui_navigation_item_dim (
  `id` BIGINT COMMENT 'Primary key for navigational item',
  `root_account_id` BIGINT COMMENT 'Foreign key to root account of the course',
  `visible` VARCHAR(256) COMMENT '(visible|hidden) Visible if this element is visible, hidden if hidden/not available in the navigation',
  `position` INTEGER UNSIGNED COMMENT 'Position in the navigation. NULL if hidden.',
UNIQUE KEY id (id)
) COMMENT = "Attributes for a navigation item";
DROP TABLE IF EXISTS course_ui_navigation_item_fact;
CREATE TABLE IF NOT EXISTS course_ui_navigation_item_fact (
  `root_account_id` BIGINT COMMENT 'Foreign key to root account of the course',
  `course_ui_navigation_item_id` BIGINT COMMENT 'Foreign key to course_ui_navigation_item_dim',
  `course_ui_canvas_navigation_id` BIGINT COMMENT 'Foreign key to navigation function',
  `external_tool_activation_id` BIGINT COMMENT 'Foreign key to external_tool_activation_dim',
  `course_id` BIGINT COMMENT 'Foreign key to course',
  `course_account_id` BIGINT COMMENT 'Foreign key to account for course',
  `enrollment_term_id` BIGINT COMMENT 'Foreign key to enrollment term'
) COMMENT = "Facts describing a single item in the navigation UI";
DROP TABLE IF EXISTS quiz_dim;
CREATE TABLE IF NOT EXISTS quiz_dim (
  `id` BIGINT COMMENT 'Unique surrogate ID for the quiz.',
  `canvas_id` BIGINT COMMENT 'Primary key for this quiz in the quizzes table.',
  `root_account_id` BIGINT COMMENT 'Root account ID associated with this quiz.',
  `name` VARCHAR(256) COMMENT 'Name of the quiz. Equivalent Canvas API field -> \'title\'.',
  `points_possible` DOUBLE COMMENT 'Total point value given to the quiz.',
  `description` LONGTEXT COMMENT 'Description of the quiz.',
  `quiz_type` VARCHAR(256) COMMENT 'Type of quiz. Possible values are \'practice_quiz\', \'assignment\', \'graded_survey\' and \'survey\'. Defaults to \'NULL\'.',
  `course_id` BIGINT COMMENT 'Foreign key to the course the quiz belongs to.',
  `assignment_id` BIGINT COMMENT 'Foreign key to the assignment the quiz belongs to.',
  `workflow_state` VARCHAR(256) COMMENT 'Denotes where the quiz is in the workflow. Possible values are \'unpublished\', \'published\' and \'deleted\'. Defaults to \'unpublished\'.',
  `scoring_policy` VARCHAR(256) COMMENT 'Scoring policy for a quiz that students can take multiple times. Is required and only valid if allowed_attempts > 1. Possible values are \'keep_highest\', \'keep_latest\' and \'keep_average\'. Defaults to \'keep_highest\'.',
  `anonymous_submissions` VARCHAR(256) COMMENT 'Dictates whether students are allowed to submit the quiz anonymously. Possible values are \'allow_anonymous_submissions\' and \'disallow_anonymous_submissions\'. Defaults to \'disallow_anonymous_submissions\'.',
  `display_questions` VARCHAR(256) COMMENT 'Policy for displaying the questions in the quiz. Possible values are \'multiple_at_a_time\' and \'one_at_a_time\'. Defaults to \'multiple_at_a_time\'. Equivalent Canvas API field -> \'one_question_at_a_time\'.',
  `answer_display_order` VARCHAR(256) COMMENT 'Policy for displaying the answers for each question in the quiz. Possible values are \'in_order\' and \'shuffled\'. Defaults to \'in_order\'. Equivalent Canvas API field -> \'shuffle_answers\'.',
  `go_back_to_previous_question` VARCHAR(256) COMMENT 'Policy on going back to the previous question. Is valid only if \'display_questions\' is set to \'one_at_a_time\'. Possible values are \'allow_going_back\' and \'disallow_going_back\'. Defaults to \'allow_going_back\'. Equivalent Canvas API field -> \'cant_go_back\'.',
  `could_be_locked` VARCHAR(256) COMMENT 'Dictates if the quiz can be locked or not. Possible values are \'allow_locking\' and \'disallow_locking\'. Defaults to \'disallow_locking\'.',
  `browser_lockdown` VARCHAR(256) COMMENT 'Dictates whether the browser has locked-down when the quiz is being taken. Possible values are \'required\' and \'not_required\'. Defaults to \'not_required\'.',
  `browser_lockdown_for_displaying_results` VARCHAR(256) COMMENT 'Dictates whether the browser has to be locked-down to display the results. Is valid only if \'hide_results\' is set to \'never\' or \'until_after_last_attempt\' (for the results to be displayed after the last attempt). Possible values are \'required\' and \'not_required\'. Defaults to \'not_required\'.',
  `browser_lockdown_monitor` VARCHAR(256) COMMENT 'Dictates whether a browser lockdown monitor is required. Possible values are \'required\' and \'not_required\'. Defaults to \'not_required\'.',
  `ip_filter` VARCHAR(256) COMMENT 'Restricts access to the quiz to computers in a specified IP range. Filters can be a comma-separated list of addresses, or an address followed by a mask.',
  `show_results` VARCHAR(256) COMMENT 'Dictates whether or not quiz results are shown to students. If set to \'always\', students can see their results after any attempt and if set to \'never\', students can never see their results. If \'dw_quiz_fact.allowed_attempts > 1\' then when set to \'always_after_last_attempt\', students can only see their results always, but only after their last attempt. Similarly, if set to \'only_once_after_last_attempt\', then students can see their results only after their last attempt, that too only once. Possible values are \'always\', \'never\', \'always_after_last_attempt\' and \'only_once_after_last_attempt\'. Defaults to \'always\'. Equivalent Canvas API field -> \'hide_results\' combined with \'one_time_results\'.',
  `show_correct_answers` VARCHAR(256) COMMENT 'Dictates whether correct answers are shown when are results are viewed. It\'s valid only if \'show_results\' is set to \'always\'. Possible values are \'always\', \'never\', \'only_once_after_last_attempt\' and \'always_after_last_attempt\' (Last two are only valid if \'dw_quiz_fact.allowed_attempts > 1\') which have a behavior similar to \'show_results\'. Defaults to \'always\'. Equivalent Canvas API field -> \'show_correct_answers\' combined with \'show_correct_answers_last_attempt\'.',
  `show_correct_answers_at` DATETIME COMMENT 'Day/Time when the correct answers would be shown.',
  `hide_correct_answers_at` DATETIME COMMENT 'Day/Time when the correct answers are to be hidden.',
  `created_at` DATETIME COMMENT 'Time when the quiz was created.',
  `updated_at` DATETIME COMMENT 'Time when the quiz was last updated.',
  `published_at` DATETIME COMMENT 'Time when the quiz was published.',
  `unlock_at` DATETIME COMMENT 'Day/Time when the quiz is to be unlocked for students.',
  `lock_at` DATETIME COMMENT 'Day/Time when the quiz is to be locked for students.',
  `due_at` DATETIME COMMENT 'Day/Time when the quiz is due.',
  `deleted_at` DATETIME COMMENT 'Time when the quiz was deleted.',
UNIQUE KEY id (id)
) COMMENT = "Attributes for quiz.";
DROP TABLE IF EXISTS quiz_fact;
CREATE TABLE IF NOT EXISTS quiz_fact (
  `quiz_id` BIGINT COMMENT 'Foreign key to quiz dimension table.',
  `points_possible` DOUBLE COMMENT 'Total point value given to the quiz.',
  `time_limit` INTEGER UNSIGNED COMMENT 'Time limit, in minutes, to complete the quiz. Set to -1 for no time limit. Defaults to -1.',
  `allowed_attempts` INTEGER UNSIGNED COMMENT 'Number of attempts allowed to complete the quiz. Set to -1 for unlimited attempts. Defaults to -1.',
  `unpublished_question_count` INTEGER UNSIGNED COMMENT 'Number of questions in the current unpublished version of the quiz.',
  `question_count` INTEGER UNSIGNED COMMENT 'Number of questions in the last published version of the quiz',
  `course_id` BIGINT COMMENT 'Foreign key to the course the quiz belongs to.',
  `assignment_id` BIGINT COMMENT 'Foreign key to the assignment the quiz belongs to.',
  `course_account_id` BIGINT COMMENT 'Foreign key to the account associated with the course associated with this quiz.',
  `enrollment_term_id` BIGINT COMMENT 'Foreign key to enrollment term the quiz belongs to.'
) COMMENT = "Measures for quiz.";
DROP TABLE IF EXISTS quiz_submission_historical_dim;
CREATE TABLE IF NOT EXISTS quiz_submission_historical_dim (
  `id` BIGINT COMMENT 'Unique surrogate ID for the quiz submission.',
  `canvas_id` BIGINT COMMENT 'Primary key for this quiz submission in the \'quiz_submissions\' Canvas table.',
  `quiz_id` BIGINT COMMENT 'ID of the quiz the quiz submission represents. Foreign key to the quiz dimension table.',
  `submission_id` BIGINT COMMENT 'ID to the submission the quiz submission represents. Foreign key to the quiz submission dimension table.',
  `user_id` BIGINT COMMENT 'ID of the user (who is a student) who made the submission. Foreign key to the user dimension table.',
  `version_number` INTEGER UNSIGNED COMMENT 'Version number of this quiz submission.',
  `submission_state` VARCHAR(256) COMMENT 'Denotes if the quiz submission is a current or previous submission. Possible values are \'current_submission\' and \'previous_submission\'. Defaults to \'current_submission\'.',
  `workflow_state` VARCHAR(256) COMMENT 'Denotes the current state of the quiz submission. Possible values are \'untaken\', \'complete\', \'pending_review\', \'preview\' and \'settings_only\'. Out of these, \'settings_only\' pertains only to quiz moderation events. It stores the settings to create and store moderation events before the student has begun an attempt. Defaults to \'untaken\'.',
  `quiz_state_during_submission` VARCHAR(256) COMMENT 'There can be two types of quiz states during submission, 1. Quiz submission took place after the quiz was manually unlocked after being locked (but only for a particular student such that (s)he can take the quiz even if it\'s locked for everyone else). 2. Quiz submission was on-time (that is, when the quiz was never locked). So the two possible values are \'manually_unlocked\' and \'never_locked\'. Defaults to \'never_locked\'.',
  `submission_scoring_policy` VARCHAR(256) COMMENT 'Denotes if the score has been manually overridden by a teacher to reflect the score of a previous attempt (as opposed to a score calculated by the quiz\'s scoring policy. Possible values are \'manually_overridden\' or the general quiz scoring policies, i.e. \'keep_highest\', \'keep_latest\' and \'keep_average\'. Defaults to the scoring policy of the quiz the submission is associated with.',
  `submission_source` VARCHAR(256) COMMENT 'Denotes where the submission was received from. Possible values are \'student\' and \'test_preview\'. Defaults to \'student\'.',
  `has_seen_results` VARCHAR(256) COMMENT 'Denotes whether the student has viewed their results to the quiz.',
  `temporary_user_code` VARCHAR(256) COMMENT 'Construct for previewing a quiz.',
  `created_at` DATETIME COMMENT 'Time when the quiz submission was created.',
  `updated_at` DATETIME COMMENT 'Time when the quiz submission was last updated.',
  `started_at` DATETIME COMMENT 'Time at which the student started the quiz submission.',
  `finished_at` DATETIME COMMENT 'Time at which the student submitted the quiz submission.',
  `due_at` DATETIME COMMENT 'Time at which the quiz submission will be overdue, and will be flagged as a late submission.',
UNIQUE KEY id (id)
) COMMENT = "Attributes for all submitted quizzes";
DROP TABLE IF EXISTS quiz_submission_historical_fact;
CREATE TABLE IF NOT EXISTS quiz_submission_historical_fact (
  `score` DOUBLE COMMENT 'Denotes the score for this submission. Its value would be NULL when they are in the \'preview\', \'untaken\' OR \'settings_only\' workflow states (since it is associated with quiz moderation events). Or its value should not be NULL when workflow state is either \'complete\' or \'pending_review\'. It defaults to NULL.',
  `kept_score` DOUBLE COMMENT 'For quizzes that allow multiple attempts, this is the actual score that will be associated with the user for this quiz. This score depends on the scoring policy we have for the submission in the quiz submission dimension table, the workflow state being \'completed\' or \'pending_review\' and the allowed attempts to be greater than 1. Its value can be NULL when not all these required conditions are met.',
  `date` DATETIME COMMENT 'Contains the same value as \'finished_at\'. Provided to support backward compatibility with the existing table in production.',
  `course_id` BIGINT COMMENT 'Foreign key to the course this submission belongs to.',
  `enrollment_term_id` BIGINT COMMENT 'Foreign key to the enrollment term of the course this submission belongs to.',
  `course_account_id` BIGINT COMMENT 'Foreign key to the account of the course this submission belongs to.',
  `quiz_id` BIGINT COMMENT 'ID of the quiz the quiz submission represents. Foreign key to the quiz dimension table.',
  `assignment_id` BIGINT COMMENT 'Foreign key to the assignment the quiz belongs to.',
  `user_id` BIGINT COMMENT 'ID of the user (who is a student) who made the submission. Foreign key to the user dimension table.',
  `submission_id` BIGINT COMMENT 'ID to the submission the quiz submission represents. Foreign key to the quiz submission dimension table.',
  `enrollment_rollup_id` BIGINT COMMENT 'Foreign key to the enrollment roll-up dimension table.',
  `quiz_submission_historical_id` BIGINT COMMENT 'Foreign key to the quiz submission dimension table.',
  `quiz_points_possible` DOUBLE COMMENT 'Maximum points that can be scored in this quiz.',
  `score_before_regrade` DOUBLE COMMENT 'Original score of the quiz submission prior to any re-grading. It\'s NULL if the submission has never been regraded. Defaults to NULL.',
  `fudge_points` DOUBLE COMMENT 'Number of points the quiz submission\'s score was fudged (changed) by. Values can be negative or positive. Defaults to 0.',
  `total_attempts` INTEGER UNSIGNED COMMENT 'Denotes the total number of attempts made by the student for the quiz. Is valid only if the quiz allows multiple attempts.',
  `extra_attempts` INTEGER UNSIGNED COMMENT 'Number of times the student was allowed to re-take the quiz over the multiple-attempt limit.',
  `extra_time` INTEGER UNSIGNED COMMENT 'Amount of extra time allowed for the quiz submission, in minutes.',
  `time_taken` INTEGER UNSIGNED COMMENT 'Time taken, in seconds, to finish the quiz.'
) COMMENT = "Measures for the all submitted quizzes";
DROP TABLE IF EXISTS quiz_submission_dim;
CREATE TABLE IF NOT EXISTS quiz_submission_dim (
  `id` BIGINT COMMENT 'Unique surrogate ID for the quiz submission.',
  `canvas_id` BIGINT COMMENT 'Primary key for this quiz submission in the \'quiz_submissions\' Canvas table.',
  `quiz_id` BIGINT COMMENT 'ID of the quiz the quiz submission represents. Foreign key to the quiz dimension table.',
  `submission_id` BIGINT COMMENT 'ID to the submission the quiz submission represents. Foreign key to the quiz submission dimension table.',
  `user_id` BIGINT COMMENT 'ID of the user (who is a student) who made the submission. Foreign key to the user dimension table.',
  `workflow_state` VARCHAR(256) COMMENT 'Denotes the current state of the quiz submission. Possible values are \'untaken\', \'complete\', \'pending_review\', \'preview\' and \'settings_only\'. Defaults to \'untaken\'. An \'untaken\' quiz submission is recorded as soon as a student starts the quiz taking process, before even answering the first question. \'pending_review\' denotes that a manual submission has been made by the student which has not been completely graded yet. This usually happens when one or more questions in the quiz cannot be autograded (e.g.. \'essay_question\' type questions). A \'preview\' workflow state is recorded when a Teacher or Admin previews a quiz (even a partial one). \'settings_only\' pertains only to quiz moderation events. It stores the settings to create and store moderation events before the student has begun an attempt.',
  `quiz_state_during_submission` VARCHAR(256) COMMENT 'There can be two types of quiz states during submission, 1. Quiz submission took place after the quiz was manually unlocked after being locked (but only for a particular student such that (s)he can take the quiz even if it\'s locked for everyone else). 2. Quiz submission was on-time (that is, when the quiz was never locked). So the two possible values are \'manually_unlocked\' and \'never_locked\'. Defaults to \'never_locked\'.',
  `submission_scoring_policy` VARCHAR(256) COMMENT 'Denotes if the score has been manually overridden by a teacher to reflect the score of a previous attempt (as opposed to a score calculated by the quiz\'s scoring policy. Possible values are \'manually_overridden\' or the general quiz scoring policies, i.e. \'keep_highest\', \'keep_latest\' and \'keep_average\'. Defaults to the scoring policy of the quiz the submission is associated with.',
  `submission_source` VARCHAR(256) COMMENT 'Denotes where the submission was received from. Possible values are \'student\' and \'test_preview\'. Defaults to \'student\'.',
  `has_seen_results` VARCHAR(256) COMMENT 'Denotes whether the student has viewed their results to the quiz.',
  `temporary_user_code` VARCHAR(256) COMMENT 'Construct for previewing a quiz.',
  `created_at` DATETIME COMMENT 'Time when the quiz submission was created.',
  `updated_at` DATETIME COMMENT 'Time when the quiz submission was last updated.',
  `started_at` DATETIME COMMENT 'Time at which the student started the quiz submission.',
  `finished_at` DATETIME COMMENT 'Time at which the student submitted the quiz submission.',
  `due_at` DATETIME COMMENT 'Time at which the quiz submission will be overdue, and will be flagged as a late submission.',
UNIQUE KEY id (id)
) COMMENT = "Attributes for the last submitted quiz";
DROP TABLE IF EXISTS quiz_submission_fact;
CREATE TABLE IF NOT EXISTS quiz_submission_fact (
  `score` DOUBLE COMMENT 'Denotes the score for this submission. Its value would be NULL when they are in the \'preview\', \'untaken\' OR \'settings_only\' workflow states (since it is associated with quiz moderation events). Or its value should not be NULL when workflow state is either \'complete\' or \'pending_review\'. It defaults to NULL.',
  `kept_score` DOUBLE COMMENT 'For quizzes that allow multiple attempts, this is the actual score that will be associated with the user for this quiz. This score depends on the scoring policy we have for the submission in the quiz submission dimension table, the workflow state being \'completed\' or \'pending_review\' and the allowed attempts to be greater than 1. Its value can be NULL when not all these required conditions are met.',
  `date` DATETIME COMMENT 'Contains the same value as \'finished_at\'. Provided to support backward compatibility with the existing table in production.',
  `course_id` BIGINT COMMENT 'Foreign key to the course this submission belongs to.',
  `enrollment_term_id` BIGINT COMMENT 'Foreign key to the enrollment term of the course this submission belongs to.',
  `course_account_id` BIGINT COMMENT 'Foreign key to the account of the course this submission belongs to.',
  `quiz_id` BIGINT COMMENT 'ID of the quiz the quiz submission represents. Foreign key to the quiz dimension table.',
  `assignment_id` BIGINT COMMENT 'Foreign key to the assignment the quiz belongs to.',
  `user_id` BIGINT COMMENT 'ID of the user (who is a student) who made the submission. Foreign key to the user dimension table.',
  `submission_id` BIGINT COMMENT 'ID to the submission the quiz submission represents. Foreign key to the quiz submission dimension table.',
  `enrollment_rollup_id` BIGINT COMMENT 'Foreign key to the enrollment roll-up dimension table.',
  `quiz_submission_id` BIGINT COMMENT 'Foreign key to the quiz submission dimension table.',
  `quiz_points_possible` DOUBLE COMMENT 'Maximum points that can be scored in this quiz.',
  `score_before_regrade` DOUBLE COMMENT 'Original score of the quiz submission prior to any re-grading. It\'s NULL if the submission has never been regraded. Defaults to NULL.',
  `fudge_points` DOUBLE COMMENT 'Number of points the quiz submission\'s score was fudged (changed) by. Values can be negative or positive. Defaults to 0.',
  `total_attempts` INTEGER UNSIGNED COMMENT 'Denotes the total number of attempts made by the student for the quiz. Is valid only if the quiz allows multiple attempts.',
  `extra_attempts` INTEGER UNSIGNED COMMENT 'Number of times the student was allowed to re-take the quiz over the multiple-attempt limit.',
  `extra_time` INTEGER UNSIGNED COMMENT 'Amount of extra time allowed for the quiz submission, in minutes.',
  `time_taken` INTEGER UNSIGNED COMMENT 'Time taken, in seconds, to finish the quiz.'
) COMMENT = "Measures for the last submitted quiz";
DROP TABLE IF EXISTS quiz_question_group_dim;
CREATE TABLE IF NOT EXISTS quiz_question_group_dim (
  `id` BIGINT COMMENT 'Unique surrogate ID for the quiz group.',
  `canvas_id` BIGINT COMMENT 'Primary key for this quiz group in the \'quiz_question_groups\' table.',
  `quiz_id` BIGINT COMMENT 'Foreign key to quiz dimension.',
  `name` VARCHAR(256) COMMENT 'Name of the quiz group.',
  `position` INTEGER UNSIGNED COMMENT 'Order in which the questions from this group will be displayed in the quiz relative to other questions in the quiz from other groups.',
  `created_at` DATETIME COMMENT 'Time when the quiz question was created.',
  `updated_at` DATETIME COMMENT 'Time when the quiz question was last updated.',
UNIQUE KEY id (id)
) COMMENT = "Attributes for quiz group.";
DROP TABLE IF EXISTS quiz_question_group_fact;
CREATE TABLE IF NOT EXISTS quiz_question_group_fact (
  `quiz_question_group_id` BIGINT COMMENT 'Foreign key to quiz group.',
  `pick_count` INTEGER UNSIGNED COMMENT 'Number of questions picked from the group for the quiz the group is associated with.',
  `question_points` DOUBLE COMMENT 'Number of points to assign per question in the group.',
  `quiz_id` BIGINT COMMENT 'Foreign key to quiz dimension.',
  `course_id` BIGINT COMMENT 'Foreign key to the course this group\'s quiz belongs to.',
  `assignment_id` BIGINT COMMENT 'Foreign key to the assignment the quiz belongs to.',
  `course_account_id` BIGINT COMMENT 'Foreign key to the account of the course this group belongs to.',
  `enrollment_term_id` BIGINT COMMENT 'Foreign key to the enrollment term of the course this group belongs to.'
) COMMENT = "Measures related to quiz groups.";
DROP TABLE IF EXISTS quiz_question_dim;
CREATE TABLE IF NOT EXISTS quiz_question_dim (
  `id` BIGINT COMMENT 'Unique surrogate key for the quiz question.',
  `canvas_id` BIGINT COMMENT 'Primary key for this quiz question in the \'quiz_questions\' table.',
  `quiz_id` BIGINT COMMENT 'Foreign key to the quiz dimension table.',
  `quiz_question_group_id` BIGINT COMMENT 'Foreign key to the quiz group dimension table.',
  `position` INTEGER UNSIGNED COMMENT 'Order in which the question will be displayed in the quiz relative to other questions associated with the quiz.',
  `workflow_state` VARCHAR(256) COMMENT 'Denotes where the quiz question is in the workflow. Possible values are \'unpublished\', \'published\' and \'deleted\'. Defaults to \'unpublished\'.',
  `created_at` DATETIME COMMENT 'Time when the quiz question was created.',
  `updated_at` DATETIME COMMENT 'Time when the quiz question was last updated.',
  `assessment_question_id` BIGINT COMMENT 'Foreign key to the assessment question dimension table (to be made available in later releases).',
  `assessment_question_version` INTEGER UNSIGNED COMMENT 'Version of the assessment question associated with the quiz question (to be made available in later releases).',
  `name` VARCHAR(256) COMMENT 'Name of the question.',
  `question_type` VARCHAR(256) COMMENT 'Denotes the type of the question. Possible values are \'calculated_question\', \'essay_question\', \'file_upload_question\', \'fill_in_multiple_blanks_question\', \'matching_question\', \'multiple_answers_question\', \'multiple_choice_question\', \'multiple_dropdowns_question\', \'numerical_question\', \'short_answer_question\', \'text_only_question\' and \'true_false_question\'.',
  `question_text` LONGTEXT COMMENT 'Text content of the question.',
  `regrade_option` VARCHAR(256) COMMENT 'Denotes if regrading is available for the question. Possible values are \'available\' and \'unavailable\' for question types \'multiple_answers_question\', \'multiple_choice_question\', \'true_false_question\' and \'NULL\' for others. Defaults to \'available\' for the allowed question types and \'NULL\' for the rest.',
  `correct_comments` LONGTEXT COMMENT 'Comments to be displayed if the student answers the question correctly.',
  `incorrect_comments` LONGTEXT COMMENT 'Comments to be displayed if the student answers the question incorrectly.',
  `neutral_comments` LONGTEXT COMMENT 'Comments to be displayed regardless of how the student answers the question.',
UNIQUE KEY id (id)
) COMMENT = "Attributes of a question associated with a quiz.";
DROP TABLE IF EXISTS quiz_question_fact;
CREATE TABLE IF NOT EXISTS quiz_question_fact (
  `quiz_question_id` BIGINT COMMENT 'Foreign key to the quiz question dimension table.',
  `quiz_id` BIGINT COMMENT 'Foreign key to the quiz dimension table.',
  `quiz_question_group_id` BIGINT COMMENT 'Foreign key to the quiz group dimension table.',
  `assessment_question_id` BIGINT COMMENT 'Foreign key to the assessment question dimension table (to be made available in later releases).',
  `course_id` BIGINT COMMENT 'Foreign key to the course this group\'s quiz belongs to.',
  `assignment_id` BIGINT COMMENT 'Foreign key to the assignment the quiz belongs to.',
  `course_account_id` BIGINT COMMENT 'Foreign key to the account of the course this group belongs to.',
  `enrollment_term_id` BIGINT COMMENT 'Foreign key to the enrollment term of the course this group belongs to.',
  `points_possible` DOUBLE COMMENT 'Maximum number of points that can be awarded for answering the question correctly.'
) COMMENT = "Measures of a question associated with a quiz.";
DROP TABLE IF EXISTS quiz_question_answer_dim;
CREATE TABLE IF NOT EXISTS quiz_question_answer_dim (
  `id` BIGINT COMMENT 'Unique surrogate key for the quiz question answer. As with all surrogate keys in Canvas Data, there is no guarantee of stability. That said, this key is particularly unstable and will likely change from dump to dump even if there are no data change.',
  `canvas_id` BIGINT COMMENT 'Primary key for this quiz question answer. No table available in Canvas.',
  `quiz_question_id` BIGINT COMMENT 'Foreign key to the quiz question dimension column.',
  `text` LONGTEXT COMMENT 'Text of the answer.',
  `html` LONGTEXT COMMENT 'HTML markup of the text.',
  `comments` LONGTEXT COMMENT 'Specific contextual comments for a particular answer.',
  `text_after_answers` LONGTEXT COMMENT '(Used in \'short_answer_question\', also known as \'fill_in_the_blank\'. Set to \'NULL\' in others) Text following the missing word.',
  `answer_match_left` VARCHAR(256) COMMENT '(Used in \'matching_question\', set to \'NULL\' in others) Static value of the answer that will be displayed on the left for students to match for.',
  `answer_match_right` VARCHAR(256) COMMENT '(Used in \'matching_question\', set to \'NULL\' in others) Correct match for the value given in \'answer_match_left\', displayed in a drop-down with other \'answer_match_right\' values.',
  `matching_answer_incorrect_matches` VARCHAR(256) COMMENT '(Used in \'matching_question\', set to \'NULL\' in others) List of distractors (incorrect answers), delimited by new lines, that will be seeded with all the \'answer_match_right\' values.',
  `numerical_answer_type` VARCHAR(256) COMMENT '(Used in \'numerical_question\', set to \'NULL\' in others) Denotes the type of numerical answer that is expected. Possible values are \'exact_answer\' and \'range_answer\'.',
  `blank_id` VARCHAR(256) COMMENT '(Used in \'fill_in_multiple_blanks_question\' and \'multiple_dropdowns_question\', set to \'NULL\' otherwise) Refers to the ID of the blank(s) in the question text.',
  `exact` DOUBLE COMMENT '(Used in \'numerical_question\' with answer type \'exact_answer\', set to \'NULL\' otherwise) Value the answer must be equal to.',
  `margin` DOUBLE COMMENT '(Used in \'numerical_question\' with answer type \'exact_answer\', set to \'NULL\' otherwise) Margin of error allowed for a student\'s answer.',
  `starting_range` DOUBLE COMMENT '(Used in \'numerical_question\' with answer type \'range_answer\', set to \'NULL\' otherwise) Start of the allowed range (inclusive).',
  `ending_range` DOUBLE COMMENT '(Used in \'numerical_question\' with answer type \'range_answer\', set to \'NULL\' otherwise) End of the allowed range (inclusive).',
UNIQUE KEY id (id,quiz_question_id)
) COMMENT = "Attributes of an answer related to a quiz question.";
DROP TABLE IF EXISTS quiz_question_answer_fact;
CREATE TABLE IF NOT EXISTS quiz_question_answer_fact (
  `quiz_question_answer_id` BIGINT COMMENT 'Foreign key to the quiz question answer dimension table. As with all surrogate keys in Canvas Data, there is no guarantee of stability. That said, this key is particularly unstable and will likely change from dump to dump even if there are no data change.',
  `quiz_question_id` BIGINT COMMENT 'Foreign key to the quiz question dimension table.',
  `quiz_question_group_id` BIGINT COMMENT 'Foreign key to the quiz group dimension table.',
  `quiz_id` BIGINT COMMENT 'Foreign key to the quiz dimension table.',
  `assessment_question_id` BIGINT COMMENT 'Foreign key to the assessment question dimension table (to be made available in later releases).',
  `course_id` BIGINT COMMENT 'Foreign key to the course this group\'s quiz belongs to.',
  `assignment_id` BIGINT COMMENT 'Foreign key to the assignment the quiz belongs to.',
  `course_account_id` BIGINT COMMENT 'Foreign key to the account of the course this group belongs to.',
  `enrollment_term_id` BIGINT COMMENT 'Foreign key to the enrollment term of the course this group belongs to.',
  `weight` DOUBLE COMMENT 'Integer value to determine correctness of the answer. Incorrect answers should be 0, correct answers should be non-negative.',
  `exact` DOUBLE COMMENT '(Used in \'numerical_question\' with answer type \'exact_answer\', set to \'NULL\' otherwise) Value the answer must be equal to.',
  `margin` DOUBLE COMMENT '(Used in \'numerical_question\' with answer type \'exact_answer\', set to \'NULL\' otherwise) Margin of error allowed for a student\'s answer.',
  `starting_range` DOUBLE COMMENT '(Used in \'numerical_question\' with answer type \'range_answer\', set to \'NULL\' otherwise) Start of the allowed range (inclusive).',
  `ending_range` DOUBLE COMMENT '(Used in \'numerical_question\' with answer type \'range_answer\', set to \'NULL\' otherwise) End of the allowed range (inclusive).'
) COMMENT = "Measures for answers related to a quiz question.";
CREATE TABLE IF NOT EXISTS requests (
  `id` VARCHAR(36) COMMENT 'Request ID assigned by the canvas system to the request.',
  `timestamp` DATETIME COMMENT 'Timestamp when the request was made in UTC.',
  `timestamp_year` VARCHAR(256) COMMENT 'Year when the request was made.',
  `timestamp_month` VARCHAR(256) COMMENT 'Month when the request was made.',
  `timestamp_day` VARCHAR(256) COMMENT 'Day when the request was made.',
  `user_id` BIGINT COMMENT 'Foreign key in user_dim for the user that made the request. If the request was made by one user masquerading as another, then this column contains the ID of the user being masqueraded as.',
  `course_id` BIGINT COMMENT 'Foreign key in course_dim for the course that owned the page requested. Set to NULL if not applicable.',
  `root_account_id` BIGINT COMMENT 'Foreign key in account_dim for the root account on which this request was made.',
  `course_account_id` BIGINT COMMENT 'Foreign key in account_dim for the account the associated course is owned by.',
  `quiz_id` BIGINT COMMENT 'Foreign key in quiz_dim if the page request is for a quiz, otherwise NULL.',
  `discussion_id` BIGINT COMMENT 'Foreign key in discussion_dim if page request is for a discussion, otherwise NULL.',
  `conversation_id` BIGINT COMMENT 'Foreign key in conversation_dim if page request is for a conversation, otherwise NULL.',
  `assignment_id` BIGINT COMMENT 'Assignment foreign key if page request is for an assignment, otherwise NULL.',
  `url` LONGTEXT COMMENT 'URL which was requested.',
  `user_agent` LONGTEXT COMMENT 'User agent header received from the users browser/client software.',
  `http_method` VARCHAR(256) COMMENT 'HTTP method/verb (GET, PUT, POST etc.) that was sent with the request.',
  `remote_ip` VARCHAR(256) COMMENT 'IP address that was recorded from the request.',
  `interaction_micros` BIGINT COMMENT 'Total time required to service the request in microseconds.',
  `web_application_controller` VARCHAR(256) COMMENT 'The controller the Canvas web application used to service this request.',
  `web_application_action` VARCHAR(256) COMMENT 'Controller the Canvas web application used to service this request. (There is a typo in the field name, in order to minimize impact, this will be changed in a future version of Canvas Data.)',
  `web_application_context_type` VARCHAR(256) COMMENT 'Containing object type the Canvas web application used to service this request.',
  `web_application_context_id` VARCHAR(256) COMMENT 'Containing object\'s ID the Canvas web application used to service this request.',
  `real_user_id` BIGINT COMMENT 'If the request was processed by one user masquerading as another, then this column contains the real user ID of the user.',
  `session_id` VARCHAR(256) COMMENT 'ID of the user\'s session where this request was made.',
  `user_agent_id` BIGINT COMMENT '(Not implemented) Foreign key to the user agent dimension table.',
  `http_status` VARCHAR(10) COMMENT 'HTTP status of the request.',
  `http_version` VARCHAR(256) COMMENT 'HTTP protocol version.'
) COMMENT = "Pageview requests. Disclaimer: The data in the requests table is a \'best effort\' attempt, and is not guaranteed to be complete or wholly accurate. This data is meant to be used for rollups and analysis in the aggregate, _not_ in isolation for auditing, or other high-stakes analysis involving examining single users or small samples. As this data is generated from the Canvas logs files, not a transactional database, there are many places along the way data can be lost and/or duplicated (though uncommon). Additionally, given the size of this data, our processes are often done on monthly cycles for many parts of the requests tables, so as errors occur they can only be rectified monthly.";
DROP TABLE IF EXISTS external_tool_activation_dim;
CREATE TABLE IF NOT EXISTS external_tool_activation_dim (
  `id` BIGINT COMMENT 'Unique surrogate id for tool activations',
  `canvas_id` BIGINT COMMENT 'Primary key for this record in the context_external_tools table in the Canvas database',
  `course_id` BIGINT COMMENT 'Foreign key to the course if this tool was activated in a course',
  `account_id` BIGINT COMMENT 'Foreign key to the account this tool was activated in if it was activated in an account',
  `activation_target_type` VARCHAR(256) COMMENT 'The type of object the tool was activated in, (course or account)',
  `url` VARCHAR(4096) COMMENT 'The URL to where the tool may launch to',
  `name` VARCHAR(256) COMMENT 'The name of tool activation as entered by the user',
  `description` VARCHAR(256) COMMENT 'The description of the tool activation as entered by the user',
  `workflow_state` VARCHAR(256) COMMENT 'Workflow state for activation (active, deleted)',
  `privacy_level` VARCHAR(256) COMMENT 'Privacy setting for activation (name_only, email_only, anonymous, public)',
  `created_at` DATETIME COMMENT 'Timestamp when the activation was created',
  `updated_at` DATETIME COMMENT 'Timestamp when the activation was last updated',
  `tool_id` VARCHAR(256) COMMENT 'The tool id received from the external tool. May be missing if the tool does not send an id.',
  `selectable_all` BOOLEAN COMMENT 'true - tool is selectable in all scenarios. false - not selectable for assignment or module selection menu',
UNIQUE KEY id (id)
) COMMENT = "Attributes for external tool (LTI) activations. Note that activations can happen on courses or accounts. If this activation is associated with a course then course_id, course_account_id and enrollment_term_id will be populated. If this activation is associated with an account then only account_id will be populated.";
DROP TABLE IF EXISTS external_tool_activation_fact;
CREATE TABLE IF NOT EXISTS external_tool_activation_fact (
  `external_tool_activation_id` BIGINT COMMENT 'Foreign key to the external_tool_activation_dim dimension with attribute for this activation',
  `course_id` BIGINT COMMENT 'Foreign key to the course if this tool was activated in a course',
  `account_id` BIGINT COMMENT 'Foreign key to the account this tool was activated in if it was activated in an account',
  `root_account_id` BIGINT COMMENT 'Foreign key to the root account for this data',
  `enrollment_term_id` BIGINT COMMENT 'Foreign key to the course\'s enrollment term if this tool was activated in a course',
  `course_account_id` BIGINT COMMENT 'Foreign key to the course\'s account if this tool was activated in a course'
) COMMENT = "Facts and denormalized dimensions for external tool (LTI) activations.";
DROP TABLE IF EXISTS wiki_dim;
CREATE TABLE IF NOT EXISTS wiki_dim (
  `id` BIGINT COMMENT 'Unique id for the wiki.',
  `canvas_id` BIGINT COMMENT 'Primary key to the wikis table in canvas.',
  `parent_type` VARCHAR(256) COMMENT 'Type of Parent the wiki belongs to. For example, Groups or Courses.',
  `title` LONGTEXT COMMENT 'Title for the wiki.',
  `created_at` DATETIME COMMENT 'Timestamp when the wiki was first saved in the system.',
  `updated_at` DATETIME COMMENT 'Timestamp when the wiki was last updated in the system.',
  `front_page_url` LONGTEXT COMMENT 'URL of the front page of the wiki.',
  `has_no_front_page` BOOLEAN COMMENT 'True if the wiki does not have a front page or is set to NULL.',
UNIQUE KEY id (id)
) COMMENT = "Attributes for wiki in canvas.";
DROP TABLE IF EXISTS wiki_fact;
CREATE TABLE IF NOT EXISTS wiki_fact (
  `wiki_id` BIGINT COMMENT 'Foreign key to the wiki dimension.',
  `parent_course_id` BIGINT COMMENT 'Foreign key to the courses table if the wiki is associated with a Course. Otherwise this field is set to NULL.',
  `parent_group_id` BIGINT COMMENT 'Foreign key to the groups table if the wiki is associated with a Group. Otherwise this field is set to NULL.',
  `parent_course_account_id` BIGINT COMMENT 'Foreign key to the account dimension for the account associated with the wiki\'s course. If the wiki is not associated to a Course, this field is set to NULL.',
  `parent_group_account_id` BIGINT COMMENT 'Foreign key to the account dimension for the account associated with the wiki\'s group. If the wiki is not associated to a Group, this field is set to NULL.',
  `account_id` BIGINT COMMENT 'Foreign key to the accounts table that this wiki belongs to. Helpful for directly finding the account associated with the wiki, irrespective of whether it belongs to a Course or a Group.',
  `root_account_id` BIGINT COMMENT 'Root account Id of the account the wiki belongs to. Foreign key to the accounts table.',
  `enrollment_term_id` BIGINT COMMENT 'Foreign key to the enrollment term table of the course this wiki is associated with. Otherwise this is set to NULL.',
  `group_category_id` BIGINT COMMENT '(Not implemented) Foreign key to the group categories table of the group this wiki is associated with. Otherwise this is set to NULL.'
) COMMENT = "Measures for wikis.";
DROP TABLE IF EXISTS wiki_page_dim;
CREATE TABLE IF NOT EXISTS wiki_page_dim (
  `id` BIGINT COMMENT 'Unique id for the wiki pages.',
  `canvas_id` BIGINT COMMENT 'Primary key for the wiki pages table.',
  `title` VARCHAR(256) COMMENT 'Title of the wiki page.',
  `body` LONGTEXT COMMENT 'Body of the wiki page. Redshift will only load the first 256 bytes of the body.',
  `workflow_state` VARCHAR(256) COMMENT 'Current state the wiki is in. For Example, active, unpublished, deleted.',
  `created_at` DATETIME COMMENT 'Timestamp when the wiki page was created in the system.',
  `updated_at` DATETIME COMMENT 'Timestamp when the wiki page was last updated in the system.',
  `url` LONGTEXT COMMENT 'URL for the wiki page.',
  `protected_editing` BOOLEAN COMMENT 'Editing protection for the wiki page. It is false by default.',
  `editing_roles` VARCHAR(256) COMMENT 'Users or roles who can edit a wiki page.',
  `revised_at` DATETIME COMMENT 'Timestamp the wiki page was last revised in the system.',
  `could_be_locked` BOOLEAN COMMENT 'True if the wiki page can be locked. This prevents it from being visible to others until ready.',
UNIQUE KEY id (id)
) COMMENT = "Attributes for wiki pages in canvas.";
DROP TABLE IF EXISTS wiki_page_fact;
CREATE TABLE IF NOT EXISTS wiki_page_fact (
  `wiki_page_id` BIGINT COMMENT 'Foreign key to the wiki pages dimension.',
  `wiki_id` BIGINT COMMENT 'Foreign key to the wikis dimension.',
  `parent_course_id` BIGINT COMMENT 'Foreign key to the courses table if the wiki that owns the wiki page is associated with a Course. Otherwise this field is set to NULL.',
  `parent_group_id` BIGINT COMMENT 'Foreign key to the groups table if the wiki that owns the wiki page is associated with a Group. Otherwise this field is set to NULL.',
  `parent_course_account_id` BIGINT COMMENT 'Foreign key to the account dimension for the account associated with the wiki page\'s course. If the wiki page is not associated to a Course, this field is set to NULL.',
  `parent_group_account_id` BIGINT COMMENT 'Foreign key to the account dimension for the account associated with the wiki page\'s group. If the wiki page is not associated to a Group, this field is set to NULL.',
  `user_id` BIGINT COMMENT 'Foreign key to the user table.',
  `account_id` BIGINT COMMENT 'Foreign key to the accounts table that this wiki page belongs to. Helpful for directly finding the account associated with the wiki page, irrespective of whether it belongs to a Course or a Group.',
  `root_account_id` BIGINT COMMENT 'Root account Id of the account the wiki belongs to. Foreign key to the accounts table.',
  `enrollment_term_id` BIGINT COMMENT 'Foreign key to the enrollment term table of the course this wiki page is associated with. Otherwise this is set to NULL.',
  `group_category_id` BIGINT COMMENT '(Not implemented) Foreign key to the group categories table of the group this wiki page is associated with. Otherwise this is set to NULL.',
  `wiki_page_comments_count` INTEGER UNSIGNED COMMENT '(Deprecated) No longer used in Canvas.',
  `view_count` INTEGER UNSIGNED COMMENT 'Number of views per wiki page.'
) COMMENT = "Measures for wiki pages.";
DROP TABLE IF EXISTS versions;
CREATE TABLE IF NOT EXISTS versions (
  table_name VARCHAR(127) PRIMARY KEY NOT NULL COMMENT 'Name of Canvas Data table',
  version BIGINT DEFAULT NULL COMMENT 'Latest version downloaded',
  incremental TINYINT DEFAULT NULL COMMENT 'Incremental (1) or complete (0)?'
) COMMENT = "Used by import script";
INSERT INTO versions (table_name, incremental, version) VALUES
  ('course_dim',0,NULL),
  ('account_dim',0,NULL),
  ('user_dim',0,NULL),
  ('pseudonym_dim',0,NULL),
  ('pseudonym_fact',0,NULL),
  ('assignment_dim',0,NULL),
  ('assignment_fact',0,NULL),
  ('assignment_rule_dim',0,NULL),
  ('submission_dim',0,NULL),
  ('submission_fact',0,NULL),
  ('submission_comment_participant_fact',0,NULL),
  ('submission_comment_participant_dim',0,NULL),
  ('submission_comment_fact',0,NULL),
  ('submission_comment_dim',0,NULL),
  ('assignment_group_dim',0,NULL),
  ('assignment_group_fact',0,NULL),
  ('assignment_group_rule_dim',0,NULL),
  ('assignment_override_user_dim',0,NULL),
  ('assignment_override_user_fact',0,NULL),
  ('assignment_override_dim',0,NULL),
  ('assignment_override_fact',0,NULL),
  ('assignment_override_user_rollup_fact',0,NULL),
  ('communication_channel_dim',0,NULL),
  ('communication_channel_fact',0,NULL),
  ('conversation_dim',0,NULL),
  ('conversation_message_dim',0,NULL),
  ('conversation_message_participant_fact',0,NULL),
  ('discussion_topic_dim',0,NULL),
  ('discussion_topic_fact',0,NULL),
  ('discussion_entry_dim',0,NULL),
  ('discussion_entry_fact',0,NULL),
  ('enrollment_term_dim',0,NULL),
  ('course_section_dim',0,NULL),
  ('role_dim',0,NULL),
  ('enrollment_dim',0,NULL),
  ('enrollment_fact',0,NULL),
  ('enrollment_rollup_dim',0,NULL),
  ('file_dim',0,NULL),
  ('file_fact',0,NULL),
  ('group_dim',0,NULL),
  ('group_fact',0,NULL),
  ('group_membership_fact',0,NULL),
  ('group_membership_dim',0,NULL),
  ('course_ui_canvas_navigation_dim',0,NULL),
  ('course_ui_navigation_item_dim',0,NULL),
  ('course_ui_navigation_item_fact',0,NULL),
  ('quiz_dim',0,NULL),
  ('quiz_fact',0,NULL),
  ('quiz_submission_historical_dim',0,NULL),
  ('quiz_submission_historical_fact',0,NULL),
  ('quiz_submission_dim',0,NULL),
  ('quiz_submission_fact',0,NULL),
  ('quiz_question_group_dim',0,NULL),
  ('quiz_question_group_fact',0,NULL),
  ('quiz_question_dim',0,NULL),
  ('quiz_question_fact',0,NULL),
  ('quiz_question_answer_dim',0,NULL),
  ('quiz_question_answer_fact',0,NULL),
  ('requests',1,NULL),
  ('external_tool_activation_dim',0,NULL),
  ('external_tool_activation_fact',0,NULL),
  ('wiki_dim',0,NULL),
  ('wiki_fact',0,NULL),
  ('wiki_page_dim',0,NULL),
  ('wiki_page_fact',0,NULL),
  ('schema',-1,11303);
