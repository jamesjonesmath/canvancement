# MySQL script to create database for Canvas Data schema version 1.16.0
SET default_storage_engine=InnoDB;
SET GLOBAL innodb_file_per_table=1;
DROP DATABASE IF EXISTS canvas_data;
CREATE DATABASE IF NOT EXISTS canvas_data DEFAULT CHARACTER SET utf8mb4;
USE canvas_data;
SET NAMES utf8mb4;
DROP TABLE IF EXISTS course_dim;
CREATE TABLE IF NOT EXISTS course_dim (
  `id` BIGINT,
  `canvas_id` BIGINT,
  `root_account_id` BIGINT,
  `account_id` BIGINT,
  `enrollment_term_id` BIGINT,
  `name` VARCHAR(256),
  `code` VARCHAR(256),
  `type` VARCHAR(256),
  `created_at` DATETIME,
  `start_at` DATETIME,
  `conclude_at` DATETIME,
  `publicly_visible` BOOLEAN,
  `sis_source_id` VARCHAR(256),
  `workflow_state` VARCHAR(256),
  `wiki_id` BIGINT,
UNIQUE KEY id (id)
);
DROP TABLE IF EXISTS account_dim;
CREATE TABLE IF NOT EXISTS account_dim (
  `id` BIGINT,
  `canvas_id` BIGINT,
  `name` VARCHAR(256),
  `depth` INTEGER UNSIGNED,
  `workflow_state` VARCHAR(256),
  `parent_account` VARCHAR(256),
  `parent_account_id` BIGINT,
  `grandparent_account` VARCHAR(256),
  `grandparent_account_id` BIGINT,
  `root_account` VARCHAR(256),
  `root_account_id` BIGINT,
  `subaccount1` VARCHAR(256),
  `subaccount1_id` BIGINT,
  `subaccount2` VARCHAR(256),
  `subaccount2_id` BIGINT,
  `subaccount3` VARCHAR(256),
  `subaccount3_id` BIGINT,
  `subaccount4` VARCHAR(256),
  `subaccount4_id` BIGINT,
  `subaccount5` VARCHAR(256),
  `subaccount5_id` BIGINT,
  `subaccount6` VARCHAR(256),
  `subaccount6_id` BIGINT,
  `subaccount7` VARCHAR(256),
  `subaccount7_id` BIGINT,
  `subaccount8` VARCHAR(256),
  `subaccount8_id` BIGINT,
  `subaccount9` VARCHAR(256),
  `subaccount9_id` BIGINT,
  `subaccount10` VARCHAR(256),
  `subaccount10_id` BIGINT,
  `subaccount11` VARCHAR(256),
  `subaccount11_id` BIGINT,
  `subaccount12` VARCHAR(256),
  `subaccount12_id` BIGINT,
  `subaccount13` VARCHAR(256),
  `subaccount13_id` BIGINT,
  `subaccount14` VARCHAR(256),
  `subaccount14_id` BIGINT,
  `subaccount15` VARCHAR(256),
  `subaccount15_id` BIGINT,
  `sis_source_id` VARCHAR(256),
UNIQUE KEY id (id)
);
DROP TABLE IF EXISTS user_dim;
CREATE TABLE IF NOT EXISTS user_dim (
  `id` BIGINT,
  `canvas_id` BIGINT,
  `root_account_id` BIGINT,
  `name` VARCHAR(256),
  `time_zone` VARCHAR(256),
  `created_at` DATETIME,
  `visibility` VARCHAR(256),
  `school_name` VARCHAR(256),
  `school_position` VARCHAR(256),
  `gender` VARCHAR(256),
  `locale` VARCHAR(256),
  `public` VARCHAR(256),
  `birthdate` DATETIME,
  `country_code` VARCHAR(256),
  `workflow_state` VARCHAR(256),
  `sortable_name` VARCHAR(256),
UNIQUE KEY id (id)
);
DROP TABLE IF EXISTS pseudonym_dim;
CREATE TABLE IF NOT EXISTS pseudonym_dim (
  `id` BIGINT,
  `canvas_id` BIGINT,
  `user_id` BIGINT,
  `account_id` BIGINT,
  `workflow_state` VARCHAR(256),
  `last_request_at` DATETIME,
  `last_login_at` DATETIME,
  `current_login_at` DATETIME,
  `last_login_ip` VARCHAR(256),
  `current_login_ip` VARCHAR(256),
  `position` INTEGER UNSIGNED,
  `created_at` DATETIME,
  `updated_at` DATETIME,
  `password_auto_generated` BOOLEAN,
  `deleted_at` DATETIME,
  `sis_user_id` VARCHAR(256),
  `unique_name` VARCHAR(256),
  `integration_id` VARCHAR(256),
  `authentication_provider_id` BIGINT,
UNIQUE KEY id (id)
);
DROP TABLE IF EXISTS pseudonym_fact;
CREATE TABLE IF NOT EXISTS pseudonym_fact (
  `pseudonym_id` BIGINT,
  `user_id` BIGINT,
  `account_id` BIGINT,
  `login_count` INTEGER UNSIGNED,
  `failed_login_count` INTEGER UNSIGNED
);
DROP TABLE IF EXISTS assignment_dim;
CREATE TABLE IF NOT EXISTS assignment_dim (
  `id` BIGINT,
  `canvas_id` BIGINT,
  `course_id` BIGINT,
  `title` VARCHAR(256),
  `description` LONGTEXT,
  `due_at` DATETIME,
  `unlock_at` DATETIME,
  `lock_at` DATETIME,
  `points_possible` DOUBLE,
  `grading_type` VARCHAR(256),
  `submission_types` VARCHAR(256),
  `workflow_state` VARCHAR(256),
  `created_at` DATETIME,
  `updated_at` DATETIME,
  `peer_review_count` INTEGER UNSIGNED,
  `peer_reviews_due_at` DATETIME,
  `peer_reviews_assigned` BOOLEAN,
  `peer_reviews` BOOLEAN,
  `automatic_peer_reviews` BOOLEAN,
  `all_day` BOOLEAN,
  `all_day_date` DATE,
  `could_be_locked` BOOLEAN,
  `grade_group_students_individually` BOOLEAN,
  `anonymous_peer_reviews` BOOLEAN,
  `muted` BOOLEAN,
  `assignment_group_id` BIGINT,
  `position` INTEGER UNSIGNED,
  `visibility` ENUM('everyone', 'only_visible_to_overrides'),
UNIQUE KEY id (id)
);
DROP TABLE IF EXISTS assignment_fact;
CREATE TABLE IF NOT EXISTS assignment_fact (
  `assignment_id` BIGINT,
  `course_id` BIGINT,
  `course_account_id` BIGINT,
  `enrollment_term_id` BIGINT,
  `points_possible` DOUBLE,
  `peer_review_count` INTEGER UNSIGNED,
  `assignment_group_id` BIGINT
);
DROP TABLE IF EXISTS assignment_rule_dim;
CREATE TABLE IF NOT EXISTS assignment_rule_dim (
  `assignment_id` BIGINT,
  `drop_rule` VARCHAR(256)
);
DROP TABLE IF EXISTS submission_dim;
CREATE TABLE IF NOT EXISTS submission_dim (
  `id` BIGINT,
  `canvas_id` BIGINT,
  `body` LONGTEXT,
  `url` VARCHAR(256),
  `grade` VARCHAR(256),
  `submitted_at` DATETIME,
  `submission_type` ENUM('discussion_topic', 'external_tool', 'media_recording', 'online_file_upload', 'online_quiz', 'online_text_entry', 'online_upload', 'online_url'),
  `workflow_state` ENUM('graded', 'pending_review', 'submitted', 'unsubmitted'),
  `created_at` DATETIME,
  `updated_at` DATETIME,
  `processed` BOOLEAN,
  `process_attempts` INTEGER UNSIGNED,
  `grade_matches_current_submission` BOOLEAN,
  `published_grade` VARCHAR(256),
  `graded_at` DATETIME,
  `has_rubric_assessment` BOOLEAN,
  `attempt` INTEGER UNSIGNED,
  `has_admin_comment` BOOLEAN,
  `assignment_id` BIGINT,
  `excused` ENUM('excused_submission', 'regular_submission'),
  `graded_anonymously` ENUM('graded_anonymously', 'not_graded_anonymously'),
  `grader_id` BIGINT,
  `group_id` BIGINT,
  `quiz_submission_id` BIGINT,
  `user_id` BIGINT,
  `grade_state` ENUM('auto_graded', 'human_graded', 'not_graded'),
UNIQUE KEY id (id)
);
DROP TABLE IF EXISTS submission_fact;
CREATE TABLE IF NOT EXISTS submission_fact (
  `submission_id` BIGINT,
  `assignment_id` BIGINT,
  `course_id` BIGINT,
  `enrollment_term_id` BIGINT,
  `user_id` BIGINT,
  `grader_id` BIGINT,
  `course_account_id` BIGINT,
  `enrollment_rollup_id` BIGINT,
  `score` DOUBLE,
  `published_score` DOUBLE,
  `what_if_score` DOUBLE,
  `submission_comments_count` INTEGER UNSIGNED,
  `account_id` BIGINT,
  `assignment_group_id` BIGINT,
  `group_id` BIGINT,
  `quiz_id` BIGINT,
  `quiz_submission_id` BIGINT,
  `wiki_id` BIGINT
);
DROP TABLE IF EXISTS submission_comment_participant_fact;
CREATE TABLE IF NOT EXISTS submission_comment_participant_fact (
  `submission_comment_participant_id` BIGINT,
  `submission_comment_id` BIGINT,
  `user_id` BIGINT,
  `submission_id` BIGINT,
  `assignment_id` BIGINT,
  `course_id` BIGINT,
  `enrollment_term_id` BIGINT,
  `course_account_id` BIGINT,
  `enrollment_rollup_id` BIGINT
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
  `submission_comment_id` BIGINT,
  `submission_id` BIGINT,
  `recipient_id` BIGINT,
  `author_id` BIGINT,
  `assignment_id` BIGINT,
  `course_id` BIGINT,
  `enrollment_term_id` BIGINT,
  `course_account_id` BIGINT,
  `message_size_bytes` INTEGER UNSIGNED,
  `message_character_count` INTEGER UNSIGNED,
  `message_word_count` INTEGER UNSIGNED,
  `message_line_count` INTEGER UNSIGNED
);
DROP TABLE IF EXISTS submission_comment_dim;
CREATE TABLE IF NOT EXISTS submission_comment_dim (
  `id` BIGINT,
  `canvas_id` BIGINT,
  `submission_id` BIGINT,
  `recipient_id` BIGINT,
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
  `id` BIGINT,
  `canvas_id` BIGINT,
  `course_id` BIGINT,
  `name` VARCHAR(256),
  `default_assignment_name` VARCHAR(256),
  `workflow_state` VARCHAR(256),
  `position` INTEGER UNSIGNED,
  `created_at` DATETIME,
  `updated_at` DATETIME,
UNIQUE KEY id (id)
);
DROP TABLE IF EXISTS assignment_group_fact;
CREATE TABLE IF NOT EXISTS assignment_group_fact (
  `assignment_group_id` BIGINT,
  `course_id` BIGINT,
  `group_weight` DOUBLE
);
DROP TABLE IF EXISTS assignment_group_rule_dim;
CREATE TABLE IF NOT EXISTS assignment_group_rule_dim (
  `assignment_group_id` BIGINT,
  `drop_lowest` INTEGER UNSIGNED,
  `drop_highest` INTEGER UNSIGNED
);
DROP TABLE IF EXISTS assignment_override_user_dim;
CREATE TABLE IF NOT EXISTS assignment_override_user_dim (
  `id` BIGINT,
  `canvas_id` BIGINT,
  `assignment_id` BIGINT,
  `assignment_override_id` BIGINT,
  `quiz_id` BIGINT,
  `user_id` BIGINT,
  `created_at` DATETIME,
  `updated_at` DATETIME,
UNIQUE KEY id (id)
);
DROP TABLE IF EXISTS assignment_override_user_fact;
CREATE TABLE IF NOT EXISTS assignment_override_user_fact (
  `assignment_override_user_id` BIGINT,
  `account_id` BIGINT,
  `assignment_group_id` BIGINT,
  `assignment_id` BIGINT,
  `assignment_override_id` BIGINT,
  `course_id` BIGINT,
  `enrollment_term_id` BIGINT,
  `quiz_id` BIGINT,
  `user_id` BIGINT
);
DROP TABLE IF EXISTS assignment_override_dim;
CREATE TABLE IF NOT EXISTS assignment_override_dim (
  `id` BIGINT,
  `canvas_id` BIGINT,
  `assignment_id` BIGINT,
  `course_section_id` BIGINT,
  `group_id` BIGINT,
  `quiz_id` BIGINT,
  `all_day` ENUM('new_all_day', 'same_all_day'),
  `all_day_date` DATE,
  `assignment_version` INTEGER UNSIGNED,
  `created_at` DATETIME,
  `due_at` DATETIME,
  `due_at_overridden` ENUM('new_due_at', 'same_due_at'),
  `lock_at` DATETIME,
  `lock_at_overridden` ENUM('new_lock_at', 'same_lock_at'),
  `set_type` ENUM('course_section', 'group', 'adhoc'),
  `title` LONGTEXT,
  `unlock_at` DATETIME,
  `unlock_at_overridden` ENUM('new_unlock_at', 'same_unlock_at'),
  `updated_at` DATETIME,
  `quiz_version` INTEGER UNSIGNED,
  `workflow_state` ENUM('active', 'deleted'),
UNIQUE KEY id (id)
);
DROP TABLE IF EXISTS assignment_override_fact;
CREATE TABLE IF NOT EXISTS assignment_override_fact (
  `assignment_override_id` BIGINT,
  `account_id` BIGINT,
  `assignment_id` BIGINT,
  `assignment_group_id` BIGINT,
  `course_id` BIGINT,
  `course_section_id` BIGINT,
  `enrollment_term_id` BIGINT,
  `group_id` BIGINT,
  `group_category_id` BIGINT,
  `group_parent_account_id` BIGINT,
  `nonxlist_course_id` BIGINT,
  `quiz_id` BIGINT,
  `group_wiki_id` BIGINT
);
DROP TABLE IF EXISTS assignment_override_user_rollup_fact;
CREATE TABLE IF NOT EXISTS assignment_override_user_rollup_fact (
  `assignment_id` BIGINT,
  `assignment_override_id` BIGINT,
  `assignment_override_user_adhoc_id` BIGINT,
  `assignment_group_id` BIGINT,
  `course_id` BIGINT,
  `course_account_id` BIGINT,
  `course_section_id` BIGINT,
  `enrollment_id` BIGINT,
  `enrollment_term_id` BIGINT,
  `group_category_id` BIGINT,
  `group_id` BIGINT,
  `group_parent_account_id` BIGINT,
  `group_wiki_id` BIGINT,
  `nonxlist_course_id` BIGINT,
  `quiz_id` BIGINT,
  `user_id` BIGINT
);
DROP TABLE IF EXISTS communication_channel_dim;
CREATE TABLE IF NOT EXISTS communication_channel_dim (
  `id` BIGINT,
  `canvas_id` BIGINT,
  `user_id` BIGINT,
  `address` VARCHAR(256),
  `type` VARCHAR(256),
  `position` INTEGER UNSIGNED,
  `workflow_state` VARCHAR(256),
  `created_at` DATETIME,
  `updated_at` DATETIME,
UNIQUE KEY id (id)
);
DROP TABLE IF EXISTS communication_channel_fact;
CREATE TABLE IF NOT EXISTS communication_channel_fact (
  `communication_channel_id` BIGINT,
  `user_id` BIGINT,
  `bounce_count` INTEGER UNSIGNED
);
DROP TABLE IF EXISTS conversation_dim;
CREATE TABLE IF NOT EXISTS conversation_dim (
  `id` BIGINT,
  `canvas_id` BIGINT,
  `has_attachments` BOOLEAN,
  `has_media_objects` BOOLEAN,
  `subject` VARCHAR(256),
  `course_id` BIGINT,
  `group_id` BIGINT,
  `account_id` BIGINT,
UNIQUE KEY id (id)
);
DROP TABLE IF EXISTS conversation_message_dim;
CREATE TABLE IF NOT EXISTS conversation_message_dim (
  `id` BIGINT,
  `canvas_id` BIGINT,
  `conversation_id` BIGINT,
  `author_id` BIGINT,
  `created_at` DATETIME,
  `generated` BOOLEAN,
  `has_attachments` BOOLEAN,
  `has_media_objects` BOOLEAN,
  `body` LONGTEXT,
UNIQUE KEY id (id)
);
DROP TABLE IF EXISTS conversation_message_participant_fact;
CREATE TABLE IF NOT EXISTS conversation_message_participant_fact (
  `conversation_message_id` BIGINT,
  `conversation_id` BIGINT,
  `user_id` BIGINT,
  `course_id` BIGINT,
  `enrollment_term_id` BIGINT,
  `course_account_id` BIGINT,
  `group_id` BIGINT,
  `account_id` BIGINT,
  `enrollment_rollup_id` BIGINT,
  `message_size_bytes` INTEGER UNSIGNED,
  `message_character_count` INTEGER UNSIGNED,
  `message_word_count` INTEGER UNSIGNED,
  `message_line_count` INTEGER UNSIGNED
);
DROP TABLE IF EXISTS discussion_topic_dim;
CREATE TABLE IF NOT EXISTS discussion_topic_dim (
  `id` BIGINT,
  `canvas_id` BIGINT,
  `title` VARCHAR(256),
  `message` LONGTEXT,
  `type` VARCHAR(256),
  `workflow_state` VARCHAR(256),
  `last_reply_at` DATETIME,
  `created_at` DATETIME,
  `updated_at` DATETIME,
  `delayed_post_at` DATETIME,
  `posted_at` DATETIME,
  `deleted_at` DATETIME,
  `discussion_type` VARCHAR(256),
  `pinned` BOOLEAN,
  `locked` BOOLEAN,
  `course_id` BIGINT,
  `group_id` BIGINT,
UNIQUE KEY id (id)
);
DROP TABLE IF EXISTS discussion_topic_fact;
CREATE TABLE IF NOT EXISTS discussion_topic_fact (
  `discussion_topic_id` BIGINT,
  `course_id` BIGINT,
  `enrollment_term_id` BIGINT,
  `course_account_id` BIGINT,
  `user_id` BIGINT,
  `assignment_id` BIGINT,
  `editor_id` BIGINT,
  `enrollment_rollup_id` BIGINT,
  `message_length` INTEGER UNSIGNED,
  `group_id` BIGINT,
  `group_parent_course_id` BIGINT,
  `group_parent_account_id` BIGINT,
  `group_parent_course_account_id` BIGINT
);
DROP TABLE IF EXISTS discussion_entry_dim;
CREATE TABLE IF NOT EXISTS discussion_entry_dim (
  `id` BIGINT,
  `canvas_id` BIGINT,
  `message` LONGTEXT,
  `workflow_state` VARCHAR(256),
  `created_at` DATETIME,
  `updated_at` DATETIME,
  `deleted_at` DATETIME,
  `depth` INTEGER UNSIGNED,
UNIQUE KEY id (id)
);
DROP TABLE IF EXISTS discussion_entry_fact;
CREATE TABLE IF NOT EXISTS discussion_entry_fact (
  `discussion_entry_id` BIGINT,
  `parent_discussion_entry_id` BIGINT,
  `user_id` BIGINT,
  `topic_id` BIGINT,
  `course_id` BIGINT,
  `enrollment_term_id` BIGINT,
  `course_account_id` BIGINT,
  `topic_user_id` BIGINT,
  `topic_assignment_id` BIGINT,
  `topic_editor_id` BIGINT,
  `enrollment_rollup_id` BIGINT,
  `message_length` INTEGER UNSIGNED
);
DROP TABLE IF EXISTS enrollment_term_dim;
CREATE TABLE IF NOT EXISTS enrollment_term_dim (
  `id` BIGINT,
  `canvas_id` BIGINT,
  `root_account_id` BIGINT,
  `name` VARCHAR(256),
  `date_start` DATETIME,
  `date_end` DATETIME,
  `sis_source_id` VARCHAR(256),
UNIQUE KEY id (id)
);
DROP TABLE IF EXISTS course_section_dim;
CREATE TABLE IF NOT EXISTS course_section_dim (
  `id` BIGINT,
  `canvas_id` BIGINT,
  `name` VARCHAR(256),
  `course_id` BIGINT,
  `enrollment_term_id` BIGINT,
  `default_section` BOOLEAN,
  `accepting_enrollments` BOOLEAN,
  `can_manually_enroll` BOOLEAN,
  `start_at` DATETIME,
  `end_at` DATETIME,
  `created_at` DATETIME,
  `updated_at` DATETIME,
  `workflow_state` VARCHAR(256),
  `restrict_enrollments_to_section_dates` BOOLEAN,
  `nonxlist_course_id` BIGINT,
  `sis_source_id` VARCHAR(256),
UNIQUE KEY id (id)
);
DROP TABLE IF EXISTS role_dim;
CREATE TABLE IF NOT EXISTS role_dim (
  `id` BIGINT,
  `canvas_id` BIGINT,
  `root_account_id` BIGINT,
  `account_id` BIGINT,
  `name` VARCHAR(256),
  `base_role_type` VARCHAR(256),
  `workflow_state` VARCHAR(256),
  `created_at` DATETIME,
  `updated_at` DATETIME,
  `deleted_at` DATETIME,
UNIQUE KEY id (id)
);
DROP TABLE IF EXISTS enrollment_dim;
CREATE TABLE IF NOT EXISTS enrollment_dim (
  `id` BIGINT,
  `canvas_id` BIGINT,
  `root_account_id` BIGINT,
  `course_section_id` BIGINT,
  `role_id` BIGINT,
  `type` VARCHAR(256),
  `workflow_state` VARCHAR(256),
  `created_at` DATETIME,
  `updated_at` DATETIME,
  `start_at` DATETIME,
  `end_at` DATETIME,
  `completed_at` DATETIME,
  `self_enrolled` BOOLEAN,
  `sis_source_id` VARCHAR(256),
  `course_id` BIGINT,
  `user_id` BIGINT,
UNIQUE KEY id (id)
);
DROP TABLE IF EXISTS enrollment_fact;
CREATE TABLE IF NOT EXISTS enrollment_fact (
  `enrollment_id` BIGINT,
  `user_id` BIGINT,
  `course_id` BIGINT,
  `enrollment_term_id` BIGINT,
  `course_account_id` BIGINT,
  `course_section_id` BIGINT,
  `computed_final_score` DOUBLE,
  `computed_current_score` DOUBLE
);
DROP TABLE IF EXISTS enrollment_rollup_dim;
CREATE TABLE IF NOT EXISTS enrollment_rollup_dim (
  `id` BIGINT,
  `user_id` BIGINT,
  `course_id` BIGINT,
  `enrollment_count` INTEGER UNSIGNED,
  `role_count` INTEGER UNSIGNED,
  `base_role_count` INTEGER UNSIGNED,
  `account_admin_role_count` INTEGER UNSIGNED,
  `teacher_enrollment_role_count` INTEGER UNSIGNED,
  `designer_enrollment_role_count` INTEGER UNSIGNED,
  `ta_enrollment_role_count` INTEGER UNSIGNED,
  `student_enrollment_role_count` INTEGER UNSIGNED,
  `observer_enrollment_role_count` INTEGER UNSIGNED,
  `account_membership_role_count` INTEGER UNSIGNED,
  `no_permissions_role_count` INTEGER UNSIGNED,
  `account_admin_enrollment_id` BIGINT,
  `teacher_enrollment_enrollment_id` BIGINT,
  `designer_enrollment_enrollment_id` BIGINT,
  `ta_enrollment_enrollment_id` BIGINT,
  `student_enrollment_enrollment_id` BIGINT,
  `observer_enrollment_enrollment_id` BIGINT,
  `account_membership_enrollment_id` BIGINT,
  `no_permissions_enrollment_id` BIGINT,
  `most_privileged_role` VARCHAR(256),
  `least_privileged_role` VARCHAR(256),
UNIQUE KEY id (id)
);
DROP TABLE IF EXISTS score_fact;
CREATE TABLE IF NOT EXISTS score_fact (
  `score_id` BIGINT,
  `canvas_id` BIGINT,
  `account_id` BIGINT,
  `course_id` BIGINT,
  `enrollment_id` BIGINT,
  `grading_period_id` BIGINT,
  `grading_period_group_id` BIGINT,
  `grading_period_group_account_id` BIGINT,
  `current_score` DOUBLE,
  `final_score` DOUBLE
);
DROP TABLE IF EXISTS score_dim;
CREATE TABLE IF NOT EXISTS score_dim (
  `id` BIGINT,
  `canvas_id` BIGINT,
  `enrollment_id` BIGINT,
  `grading_period_id` BIGINT,
  `created_at` DATETIME,
  `updated_at` DATETIME,
  `workflow_state` VARCHAR(256),
UNIQUE KEY id (id)
);
DROP TABLE IF EXISTS grading_period_fact;
CREATE TABLE IF NOT EXISTS grading_period_fact (
  `grading_period_id` BIGINT,
  `canvas_id` BIGINT,
  `grading_period_group_id` BIGINT,
  `grading_period_group_account_id` BIGINT,
  `grading_period_group_course_id` BIGINT,
  `weight` DOUBLE
);
DROP TABLE IF EXISTS grading_period_dim;
CREATE TABLE IF NOT EXISTS grading_period_dim (
  `id` BIGINT,
  `canvas_id` BIGINT,
  `grading_period_group_id` BIGINT,
  `close_date` DATETIME,
  `created_at` DATETIME,
  `end_date` DATETIME,
  `start_date` DATETIME,
  `title` VARCHAR(256),
  `updated_at` DATETIME,
  `workflow_state` VARCHAR(256),
UNIQUE KEY id (id)
);
DROP TABLE IF EXISTS grading_period_group_dim;
CREATE TABLE IF NOT EXISTS grading_period_group_dim (
  `id` BIGINT,
  `canvas_id` BIGINT,
  `course_id` BIGINT,
  `account_id` BIGINT,
  `created_at` DATETIME,
  `title` VARCHAR(256),
  `updated_at` DATETIME,
  `workflow_state` VARCHAR(256),
UNIQUE KEY id (id)
);
DROP TABLE IF EXISTS file_dim;
CREATE TABLE IF NOT EXISTS file_dim (
  `id` BIGINT,
  `canvas_id` BIGINT,
  `display_name` LONGTEXT,
  `account_id` BIGINT,
  `assignment_id` BIGINT,
  `conversation_message_id` BIGINT,
  `course_id` BIGINT,
  `folder_id` BIGINT,
  `group_id` BIGINT,
  `quiz_id` BIGINT,
  `quiz_submission_id` BIGINT,
  `replacement_file_id` BIGINT,
  `root_file_id` BIGINT,
  `submission_id` BIGINT,
  `uploader_id` BIGINT,
  `user_id` BIGINT,
  `owner_entity_type` ENUM('account', 'assignment', 'conversation_message', 'course', 'group', 'quiz', 'quiz_submission', 'submission', 'user'),
  `content_type` VARCHAR(256),
  `md5` VARCHAR(256),
  `file_state` ENUM('available', 'broken', 'deleted', 'errored', 'hidden'),
  `could_be_locked` ENUM('allow_locking', 'disallow_locking'),
  `locked` ENUM('is_locked', 'is_not_locked'),
  `lock_at` DATETIME,
  `unlock_at` DATETIME,
  `viewed_at` DATETIME,
  `created_at` DATETIME,
  `updated_at` DATETIME,
  `deleted_at` DATETIME,
UNIQUE KEY id (id)
);
DROP TABLE IF EXISTS file_fact;
CREATE TABLE IF NOT EXISTS file_fact (
  `file_id` BIGINT,
  `account_id` BIGINT,
  `assignment_id` BIGINT,
  `assignment_group_id` BIGINT,
  `conversation_id` BIGINT,
  `conversation_message_author_id` BIGINT,
  `conversation_message_id` BIGINT,
  `course_id` BIGINT,
  `enrollment_rollup_id` BIGINT,
  `enrollment_term_id` BIGINT,
  `folder_id` BIGINT,
  `grader_id` BIGINT,
  `group_id` BIGINT,
  `group_category_id` BIGINT,
  `quiz_id` BIGINT,
  `quiz_submission_id` BIGINT,
  `replacement_file_id` BIGINT,
  `root_file_id` BIGINT,
  `sis_source_id` VARCHAR(256),
  `submission_id` BIGINT,
  `uploader_id` BIGINT,
  `user_id` BIGINT,
  `wiki_id` BIGINT,
  `size` BIGINT
);
DROP TABLE IF EXISTS group_dim;
CREATE TABLE IF NOT EXISTS group_dim (
  `id` BIGINT,
  `canvas_id` BIGINT,
  `name` VARCHAR(256),
  `description` LONGTEXT,
  `created_at` DATETIME,
  `updated_at` DATETIME,
  `deleted_at` DATETIME,
  `is_public` BOOLEAN,
  `workflow_state` VARCHAR(256),
  `context_type` VARCHAR(256),
  `category` LONGTEXT,
  `join_level` VARCHAR(256),
  `default_view` VARCHAR(256),
  `sis_source_id` BIGINT,
  `group_category_id` BIGINT,
  `account_id` BIGINT,
  `wiki_id` BIGINT,
UNIQUE KEY id (id)
);
DROP TABLE IF EXISTS group_fact;
CREATE TABLE IF NOT EXISTS group_fact (
  `group_id` BIGINT,
  `parent_course_id` BIGINT,
  `parent_account_id` BIGINT,
  `parent_course_account_id` BIGINT,
  `enrollment_term_id` BIGINT,
  `max_membership` INTEGER UNSIGNED,
  `storage_quota` BIGINT,
  `group_category_id` BIGINT,
  `account_id` BIGINT,
  `wiki_id` BIGINT
);
DROP TABLE IF EXISTS group_membership_fact;
CREATE TABLE IF NOT EXISTS group_membership_fact (
  `group_id` BIGINT,
  `parent_course_id` BIGINT,
  `parent_account_id` BIGINT,
  `parent_course_account_id` BIGINT,
  `enrollment_term_id` BIGINT,
  `user_id` BIGINT,
  `group_membership_id` VARCHAR(256)
);
DROP TABLE IF EXISTS group_membership_dim;
CREATE TABLE IF NOT EXISTS group_membership_dim (
  `id` VARCHAR(256),
  `canvas_id` VARCHAR(256),
  `group_id` BIGINT,
  `moderator` ENUM('is_moderator', 'not_moderator'),
  `workflow_state` ENUM('accepted', 'invited', 'requested', 'deleted'),
  `created_at` DATETIME,
  `updated_at` DATETIME,
UNIQUE KEY id (id)
);
DROP TABLE IF EXISTS module_dim;
CREATE TABLE IF NOT EXISTS module_dim (
  `id` BIGINT,
  `canvas_id` BIGINT,
  `course_id` BIGINT,
  `require_sequential_progress` ENUM('required', 'not_required', 'unspecified'),
  `workflow_state` ENUM('locked', 'completed', 'unlocked', 'started'),
  `position` INTEGER UNSIGNED,
  `name` LONGTEXT,
  `created_at` DATETIME,
  `deleted_at` DATETIME,
  `unlock_at` DATETIME,
  `updated_at` DATETIME,
UNIQUE KEY id (id)
);
DROP TABLE IF EXISTS module_fact;
CREATE TABLE IF NOT EXISTS module_fact (
  `module_id` BIGINT,
  `account_id` BIGINT,
  `course_id` BIGINT,
  `enrollment_term_id` BIGINT,
  `wiki_id` BIGINT
);
DROP TABLE IF EXISTS module_item_dim;
CREATE TABLE IF NOT EXISTS module_item_dim (
  `id` BIGINT,
  `canvas_id` BIGINT,
  `assignment_id` BIGINT,
  `course_id` BIGINT,
  `discussion_topic_id` BIGINT,
  `file_id` BIGINT,
  `module_id` BIGINT,
  `quiz_id` BIGINT,
  `wiki_page_id` BIGINT,
  `content_type` ENUM('Assignment', 'Attachment', 'DiscussionTopic', 'ContextExternalTool', 'ContextModuleSubHeader', 'ExternalUrl', 'LearningOutcome', 'Quiz', 'Rubric', 'WikiPage'),
  `workflow_state` ENUM('active', 'unpublished', 'deleted'),
  `position` INTEGER UNSIGNED,
  `title` LONGTEXT,
  `url` LONGTEXT,
  `created_at` DATETIME,
  `updated_at` DATETIME,
UNIQUE KEY id (id)
);
DROP TABLE IF EXISTS module_item_fact;
CREATE TABLE IF NOT EXISTS module_item_fact (
  `module_item_id` BIGINT,
  `account_id` BIGINT,
  `assignment_id` BIGINT,
  `assignment_group_id` BIGINT,
  `course_id` BIGINT,
  `discussion_topic_id` BIGINT,
  `discussion_topic_editor_id` BIGINT,
  `enrollment_rollup_id` BIGINT,
  `enrollment_term_id` BIGINT,
  `file_id` BIGINT,
  `module_id` BIGINT,
  `quiz_id` BIGINT,
  `user_id` BIGINT,
  `wiki_id` BIGINT,
  `wiki_page_id` BIGINT
);
DROP TABLE IF EXISTS module_progression_dim;
CREATE TABLE IF NOT EXISTS module_progression_dim (
  `id` BIGINT,
  `canvas_id` BIGINT,
  `module_id` BIGINT,
  `user_id` BIGINT,
  `collapsed` ENUM('collapsed', 'not_collapsed', 'unspecified'),
  `is_current` ENUM('current', 'not_current', 'unspecified'),
  `workflow_state` ENUM('locked', 'completed', 'unlocked', 'started'),
  `current_position` INTEGER UNSIGNED,
  `lock_version` INTEGER UNSIGNED,
  `created_at` DATETIME,
  `completed_at` DATETIME,
  `evaluated_at` DATETIME,
  `updated_at` DATETIME,
UNIQUE KEY id (id)
);
DROP TABLE IF EXISTS module_progression_fact;
CREATE TABLE IF NOT EXISTS module_progression_fact (
  `module_progression_id` BIGINT,
  `account_id` BIGINT,
  `course_id` BIGINT,
  `enrollment_term_id` BIGINT,
  `module_id` BIGINT,
  `user_id` BIGINT,
  `wiki_id` BIGINT
);
DROP TABLE IF EXISTS module_completion_requirement_dim;
CREATE TABLE IF NOT EXISTS module_completion_requirement_dim (
  `id` BIGINT,
  `module_id` BIGINT,
  `module_item_id` BIGINT,
  `requirement_type` ENUM('must_view', 'must_mark_done', 'min_score', 'must_submit'),
UNIQUE KEY id (id)
);
DROP TABLE IF EXISTS module_completion_requirement_fact;
CREATE TABLE IF NOT EXISTS module_completion_requirement_fact (
  `module_completion_requirement_id` BIGINT,
  `account_id` BIGINT,
  `assignment_id` BIGINT,
  `assignment_group_id` BIGINT,
  `course_id` BIGINT,
  `discussion_topic_id` BIGINT,
  `discussion_topic_editor_id` BIGINT,
  `enrollment_rollup_id` BIGINT,
  `enrollment_term_id` BIGINT,
  `file_id` BIGINT,
  `module_id` BIGINT,
  `module_item_id` BIGINT,
  `quiz_id` BIGINT,
  `user_id` BIGINT,
  `wiki_id` BIGINT,
  `wiki_page_id` BIGINT,
  `min_score` DOUBLE
);
DROP TABLE IF EXISTS module_prerequisite_dim;
CREATE TABLE IF NOT EXISTS module_prerequisite_dim (
  `id` BIGINT,
  `module_id` BIGINT,
  `prerequisite_module_id` BIGINT,
UNIQUE KEY id (id)
);
DROP TABLE IF EXISTS module_prerequisite_fact;
CREATE TABLE IF NOT EXISTS module_prerequisite_fact (
  `module_prerequisite_id` BIGINT,
  `account_id` BIGINT,
  `course_id` BIGINT,
  `enrollment_term_id` BIGINT,
  `module_id` BIGINT,
  `prerequisite_module_id` BIGINT,
  `prerequisite_wiki_id` BIGINT,
  `wiki_id` BIGINT
);
DROP TABLE IF EXISTS module_progression_completion_requirement_dim;
CREATE TABLE IF NOT EXISTS module_progression_completion_requirement_dim (
  `id` BIGINT,
  `module_progression_id` BIGINT,
  `module_item_id` BIGINT,
  `requirement_type` ENUM('must_view', 'must_mark_done', 'min_score', 'must_submit'),
  `completion_status` ENUM('complete', 'incomplete'),
UNIQUE KEY id (id)
);
DROP TABLE IF EXISTS module_progression_completion_requirement_fact;
CREATE TABLE IF NOT EXISTS module_progression_completion_requirement_fact (
  `module_progression_completion_requirement_id` BIGINT,
  `account_id` BIGINT,
  `assignment_id` BIGINT,
  `assignment_group_id` BIGINT,
  `course_id` BIGINT,
  `discussion_topic_id` BIGINT,
  `discussion_topic_editor_id` BIGINT,
  `enrollment_rollup_id` BIGINT,
  `enrollment_term_id` BIGINT,
  `file_id` BIGINT,
  `module_id` BIGINT,
  `module_item_id` BIGINT,
  `module_progression_id` BIGINT,
  `quiz_id` BIGINT,
  `user_id` BIGINT,
  `wiki_id` BIGINT,
  `wiki_page_id` BIGINT,
  `min_score` DOUBLE,
  `score` DOUBLE
);
DROP TABLE IF EXISTS course_ui_canvas_navigation_dim;
CREATE TABLE IF NOT EXISTS course_ui_canvas_navigation_dim (
  `id` BIGINT,
  `canvas_id` BIGINT,
  `name` VARCHAR(256),
  `default` VARCHAR(256),
  `original_position` VARCHAR(256),
UNIQUE KEY id (id)
);
DROP TABLE IF EXISTS course_ui_navigation_item_dim;
CREATE TABLE IF NOT EXISTS course_ui_navigation_item_dim (
  `id` BIGINT,
  `root_account_id` BIGINT,
  `visible` VARCHAR(256),
  `position` INTEGER UNSIGNED,
UNIQUE KEY id (id)
);
DROP TABLE IF EXISTS course_ui_navigation_item_fact;
CREATE TABLE IF NOT EXISTS course_ui_navigation_item_fact (
  `root_account_id` BIGINT,
  `course_ui_navigation_item_id` BIGINT,
  `course_ui_canvas_navigation_id` BIGINT,
  `external_tool_activation_id` BIGINT,
  `course_id` BIGINT,
  `course_account_id` BIGINT,
  `enrollment_term_id` BIGINT
);
DROP TABLE IF EXISTS quiz_dim;
CREATE TABLE IF NOT EXISTS quiz_dim (
  `id` BIGINT,
  `canvas_id` BIGINT,
  `root_account_id` BIGINT,
  `name` VARCHAR(256),
  `points_possible` DOUBLE,
  `description` LONGTEXT,
  `quiz_type` VARCHAR(256),
  `course_id` BIGINT,
  `assignment_id` BIGINT,
  `workflow_state` VARCHAR(256),
  `scoring_policy` VARCHAR(256),
  `anonymous_submissions` VARCHAR(256),
  `display_questions` VARCHAR(256),
  `answer_display_order` VARCHAR(256),
  `go_back_to_previous_question` VARCHAR(256),
  `could_be_locked` VARCHAR(256),
  `browser_lockdown` VARCHAR(256),
  `browser_lockdown_for_displaying_results` VARCHAR(256),
  `browser_lockdown_monitor` VARCHAR(256),
  `ip_filter` VARCHAR(256),
  `show_results` VARCHAR(256),
  `show_correct_answers` VARCHAR(256),
  `show_correct_answers_at` DATETIME,
  `hide_correct_answers_at` DATETIME,
  `created_at` DATETIME,
  `updated_at` DATETIME,
  `published_at` DATETIME,
  `unlock_at` DATETIME,
  `lock_at` DATETIME,
  `due_at` DATETIME,
  `deleted_at` DATETIME,
UNIQUE KEY id (id)
);
DROP TABLE IF EXISTS quiz_fact;
CREATE TABLE IF NOT EXISTS quiz_fact (
  `quiz_id` BIGINT,
  `points_possible` DOUBLE,
  `time_limit` INTEGER UNSIGNED,
  `allowed_attempts` INTEGER UNSIGNED,
  `unpublished_question_count` INTEGER UNSIGNED,
  `question_count` INTEGER UNSIGNED,
  `course_id` BIGINT,
  `assignment_id` BIGINT,
  `course_account_id` BIGINT,
  `enrollment_term_id` BIGINT
);
DROP TABLE IF EXISTS quiz_submission_historical_dim;
CREATE TABLE IF NOT EXISTS quiz_submission_historical_dim (
  `id` BIGINT,
  `canvas_id` BIGINT,
  `quiz_id` BIGINT,
  `submission_id` BIGINT,
  `user_id` BIGINT,
  `version_number` INTEGER UNSIGNED,
  `submission_state` VARCHAR(256),
  `workflow_state` VARCHAR(256),
  `quiz_state_during_submission` VARCHAR(256),
  `submission_scoring_policy` VARCHAR(256),
  `submission_source` VARCHAR(256),
  `has_seen_results` VARCHAR(256),
  `temporary_user_code` VARCHAR(256),
  `created_at` DATETIME,
  `updated_at` DATETIME,
  `started_at` DATETIME,
  `finished_at` DATETIME,
  `due_at` DATETIME,
UNIQUE KEY id (id)
);
DROP TABLE IF EXISTS quiz_submission_historical_fact;
CREATE TABLE IF NOT EXISTS quiz_submission_historical_fact (
  `score` DOUBLE,
  `kept_score` DOUBLE,
  `date` DATETIME,
  `course_id` BIGINT,
  `enrollment_term_id` BIGINT,
  `course_account_id` BIGINT,
  `quiz_id` BIGINT,
  `assignment_id` BIGINT,
  `user_id` BIGINT,
  `submission_id` BIGINT,
  `enrollment_rollup_id` BIGINT,
  `quiz_submission_historical_id` BIGINT,
  `quiz_points_possible` DOUBLE,
  `score_before_regrade` DOUBLE,
  `fudge_points` DOUBLE,
  `total_attempts` INTEGER UNSIGNED,
  `extra_attempts` INTEGER UNSIGNED,
  `extra_time` INTEGER UNSIGNED,
  `time_taken` INTEGER UNSIGNED
);
DROP TABLE IF EXISTS quiz_submission_dim;
CREATE TABLE IF NOT EXISTS quiz_submission_dim (
  `id` BIGINT,
  `canvas_id` BIGINT,
  `quiz_id` BIGINT,
  `submission_id` BIGINT,
  `user_id` BIGINT,
  `workflow_state` VARCHAR(256),
  `quiz_state_during_submission` VARCHAR(256),
  `submission_scoring_policy` VARCHAR(256),
  `submission_source` VARCHAR(256),
  `has_seen_results` VARCHAR(256),
  `temporary_user_code` VARCHAR(256),
  `created_at` DATETIME,
  `updated_at` DATETIME,
  `started_at` DATETIME,
  `finished_at` DATETIME,
  `due_at` DATETIME,
UNIQUE KEY id (id)
);
DROP TABLE IF EXISTS quiz_submission_fact;
CREATE TABLE IF NOT EXISTS quiz_submission_fact (
  `score` DOUBLE,
  `kept_score` DOUBLE,
  `date` DATETIME,
  `course_id` BIGINT,
  `enrollment_term_id` BIGINT,
  `course_account_id` BIGINT,
  `quiz_id` BIGINT,
  `assignment_id` BIGINT,
  `user_id` BIGINT,
  `submission_id` BIGINT,
  `enrollment_rollup_id` BIGINT,
  `quiz_submission_id` BIGINT,
  `quiz_points_possible` DOUBLE,
  `score_before_regrade` DOUBLE,
  `fudge_points` DOUBLE,
  `total_attempts` INTEGER UNSIGNED,
  `extra_attempts` INTEGER UNSIGNED,
  `extra_time` INTEGER UNSIGNED,
  `time_taken` INTEGER UNSIGNED
);
DROP TABLE IF EXISTS quiz_question_group_dim;
CREATE TABLE IF NOT EXISTS quiz_question_group_dim (
  `id` BIGINT,
  `canvas_id` BIGINT,
  `quiz_id` BIGINT,
  `name` VARCHAR(256),
  `position` INTEGER UNSIGNED,
  `created_at` DATETIME,
  `updated_at` DATETIME,
UNIQUE KEY id (id)
);
DROP TABLE IF EXISTS quiz_question_group_fact;
CREATE TABLE IF NOT EXISTS quiz_question_group_fact (
  `quiz_question_group_id` BIGINT,
  `pick_count` INTEGER UNSIGNED,
  `question_points` DOUBLE,
  `quiz_id` BIGINT,
  `course_id` BIGINT,
  `assignment_id` BIGINT,
  `course_account_id` BIGINT,
  `enrollment_term_id` BIGINT
);
DROP TABLE IF EXISTS quiz_question_dim;
CREATE TABLE IF NOT EXISTS quiz_question_dim (
  `id` BIGINT,
  `canvas_id` BIGINT,
  `quiz_id` BIGINT,
  `quiz_question_group_id` BIGINT,
  `position` INTEGER UNSIGNED,
  `workflow_state` VARCHAR(256),
  `created_at` DATETIME,
  `updated_at` DATETIME,
  `assessment_question_id` BIGINT,
  `assessment_question_version` INTEGER UNSIGNED,
  `name` VARCHAR(256),
  `question_type` VARCHAR(256),
  `question_text` LONGTEXT,
  `regrade_option` VARCHAR(256),
  `correct_comments` LONGTEXT,
  `incorrect_comments` LONGTEXT,
  `neutral_comments` LONGTEXT,
UNIQUE KEY id (id)
);
DROP TABLE IF EXISTS quiz_question_fact;
CREATE TABLE IF NOT EXISTS quiz_question_fact (
  `quiz_question_id` BIGINT,
  `quiz_id` BIGINT,
  `quiz_question_group_id` BIGINT,
  `assessment_question_id` BIGINT,
  `course_id` BIGINT,
  `assignment_id` BIGINT,
  `course_account_id` BIGINT,
  `enrollment_term_id` BIGINT,
  `points_possible` DOUBLE
);
DROP TABLE IF EXISTS quiz_question_answer_dim;
CREATE TABLE IF NOT EXISTS quiz_question_answer_dim (
  `id` BIGINT,
  `canvas_id` BIGINT,
  `quiz_question_id` BIGINT,
  `text` LONGTEXT,
  `html` LONGTEXT,
  `comments` LONGTEXT,
  `text_after_answers` LONGTEXT,
  `answer_match_left` VARCHAR(256),
  `answer_match_right` VARCHAR(256),
  `matching_answer_incorrect_matches` VARCHAR(256),
  `numerical_answer_type` VARCHAR(256),
  `blank_id` VARCHAR(256),
  `exact` DOUBLE,
  `margin` DOUBLE,
  `starting_range` DOUBLE,
  `ending_range` DOUBLE,
UNIQUE KEY id (id,quiz_question_id)
);
DROP TABLE IF EXISTS quiz_question_answer_fact;
CREATE TABLE IF NOT EXISTS quiz_question_answer_fact (
  `quiz_question_answer_id` BIGINT,
  `quiz_question_id` BIGINT,
  `quiz_question_group_id` BIGINT,
  `quiz_id` BIGINT,
  `assessment_question_id` BIGINT,
  `course_id` BIGINT,
  `assignment_id` BIGINT,
  `course_account_id` BIGINT,
  `enrollment_term_id` BIGINT,
  `weight` DOUBLE,
  `exact` DOUBLE,
  `margin` DOUBLE,
  `starting_range` DOUBLE,
  `ending_range` DOUBLE
);
CREATE TABLE IF NOT EXISTS requests (
  `id` VARCHAR(36),
  `timestamp` DATETIME,
  `timestamp_year` VARCHAR(256),
  `timestamp_month` VARCHAR(256),
  `timestamp_day` VARCHAR(256),
  `user_id` BIGINT,
  `course_id` BIGINT,
  `root_account_id` BIGINT,
  `course_account_id` BIGINT,
  `quiz_id` BIGINT,
  `discussion_id` BIGINT,
  `conversation_id` BIGINT,
  `assignment_id` BIGINT,
  `url` LONGTEXT,
  `user_agent` LONGTEXT,
  `http_method` VARCHAR(256),
  `remote_ip` VARCHAR(256),
  `interaction_micros` BIGINT,
  `web_application_controller` VARCHAR(256),
  `web_application_action` VARCHAR(256),
  `web_application_context_type` VARCHAR(256),
  `web_application_context_id` VARCHAR(256),
  `real_user_id` BIGINT,
  `session_id` VARCHAR(256),
  `user_agent_id` BIGINT,
  `http_status` VARCHAR(10),
  `http_version` VARCHAR(256)
);
DROP TABLE IF EXISTS external_tool_activation_dim;
CREATE TABLE IF NOT EXISTS external_tool_activation_dim (
  `id` BIGINT,
  `canvas_id` BIGINT,
  `course_id` BIGINT,
  `account_id` BIGINT,
  `activation_target_type` VARCHAR(256),
  `url` VARCHAR(4096),
  `name` VARCHAR(256),
  `description` VARCHAR(256),
  `workflow_state` VARCHAR(256),
  `privacy_level` VARCHAR(256),
  `created_at` DATETIME,
  `updated_at` DATETIME,
  `tool_id` VARCHAR(256),
  `selectable_all` BOOLEAN,
UNIQUE KEY id (id)
);
DROP TABLE IF EXISTS external_tool_activation_fact;
CREATE TABLE IF NOT EXISTS external_tool_activation_fact (
  `external_tool_activation_id` BIGINT,
  `course_id` BIGINT,
  `account_id` BIGINT,
  `root_account_id` BIGINT,
  `enrollment_term_id` BIGINT,
  `course_account_id` BIGINT
);
DROP TABLE IF EXISTS wiki_dim;
CREATE TABLE IF NOT EXISTS wiki_dim (
  `id` BIGINT,
  `canvas_id` BIGINT,
  `parent_type` VARCHAR(256),
  `title` LONGTEXT,
  `created_at` DATETIME,
  `updated_at` DATETIME,
  `front_page_url` LONGTEXT,
  `has_no_front_page` BOOLEAN,
UNIQUE KEY id (id)
);
DROP TABLE IF EXISTS wiki_fact;
CREATE TABLE IF NOT EXISTS wiki_fact (
  `wiki_id` BIGINT,
  `parent_course_id` BIGINT,
  `parent_group_id` BIGINT,
  `parent_course_account_id` BIGINT,
  `parent_group_account_id` BIGINT,
  `account_id` BIGINT,
  `root_account_id` BIGINT,
  `enrollment_term_id` BIGINT,
  `group_category_id` BIGINT
);
DROP TABLE IF EXISTS wiki_page_dim;
CREATE TABLE IF NOT EXISTS wiki_page_dim (
  `id` BIGINT,
  `canvas_id` BIGINT,
  `title` VARCHAR(256),
  `body` LONGTEXT,
  `workflow_state` VARCHAR(256),
  `created_at` DATETIME,
  `updated_at` DATETIME,
  `url` LONGTEXT,
  `protected_editing` BOOLEAN,
  `editing_roles` VARCHAR(256),
  `revised_at` DATETIME,
  `could_be_locked` BOOLEAN,
UNIQUE KEY id (id)
);
DROP TABLE IF EXISTS wiki_page_fact;
CREATE TABLE IF NOT EXISTS wiki_page_fact (
  `wiki_page_id` BIGINT,
  `wiki_id` BIGINT,
  `parent_course_id` BIGINT,
  `parent_group_id` BIGINT,
  `parent_course_account_id` BIGINT,
  `parent_group_account_id` BIGINT,
  `user_id` BIGINT,
  `account_id` BIGINT,
  `root_account_id` BIGINT,
  `enrollment_term_id` BIGINT,
  `group_category_id` BIGINT,
  `wiki_page_comments_count` INTEGER UNSIGNED,
  `view_count` INTEGER UNSIGNED
);
DROP TABLE IF EXISTS versions;
CREATE TABLE IF NOT EXISTS versions (
  table_name VARCHAR(127) PRIMARY KEY NOT NULL,
  version BIGINT DEFAULT NULL,
  incremental TINYINT DEFAULT NULL
);
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
  ('score_fact',0,NULL),
  ('score_dim',0,NULL),
  ('grading_period_fact',0,NULL),
  ('grading_period_dim',0,NULL),
  ('grading_period_group_dim',0,NULL),
  ('file_dim',0,NULL),
  ('file_fact',0,NULL),
  ('group_dim',0,NULL),
  ('group_fact',0,NULL),
  ('group_membership_fact',0,NULL),
  ('group_membership_dim',0,NULL),
  ('module_dim',0,NULL),
  ('module_fact',0,NULL),
  ('module_item_dim',0,NULL),
  ('module_item_fact',0,NULL),
  ('module_progression_dim',0,NULL),
  ('module_progression_fact',0,NULL),
  ('module_completion_requirement_dim',0,NULL),
  ('module_completion_requirement_fact',0,NULL),
  ('module_prerequisite_dim',0,NULL),
  ('module_prerequisite_fact',0,NULL),
  ('module_progression_completion_requirement_dim',0,NULL),
  ('module_progression_completion_requirement_fact',0,NULL),
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
  ('schema',-1,11600);
