# MySQL script to create database for Canvas Data schema version 1.9.0
DROP DATABASE IF EXISTS canvas_data;
CREATE DATABASE IF NOT EXISTS canvas_data;
USE canvas_data;
SET NAMES utf8;
DROP TABLE IF EXISTS course_dim;
CREATE TABLE IF NOT EXISTS course_dim (
  `id` BIGINT PRIMARY KEY,
  `canvas_id` BIGINT,
  `root_account_id` BIGINT,
  `account_id` BIGINT,
  `enrollment_term_id` BIGINT,
  `name` VARCHAR(256),
  `code` VARCHAR(256),
  `type` VARCHAR(256),
  `created_at` TIMESTAMP NULL,
  `start_at` TIMESTAMP NULL,
  `conclude_at` TIMESTAMP NULL,
  `publicly_visible` BOOLEAN,
  `sis_source_id` VARCHAR(256),
  `workflow_state` VARCHAR(256),
  `wiki_id` BIGINT
) ENGINE = MyISAM DEFAULT CHARSET=utf8;
DROP TABLE IF EXISTS account_dim;
CREATE TABLE IF NOT EXISTS account_dim (
  `id` BIGINT PRIMARY KEY,
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
  `sis_source_id` VARCHAR(256)
) ENGINE = MyISAM DEFAULT CHARSET=utf8;
DROP TABLE IF EXISTS user_dim;
CREATE TABLE IF NOT EXISTS user_dim (
  `id` BIGINT PRIMARY KEY,
  `canvas_id` BIGINT,
  `root_account_id` BIGINT,
  `name` VARCHAR(256),
  `time_zone` VARCHAR(256),
  `created_at` TIMESTAMP NULL,
  `visibility` VARCHAR(256),
  `school_name` VARCHAR(256),
  `school_position` VARCHAR(256),
  `gender` VARCHAR(256),
  `locale` VARCHAR(256),
  `public` VARCHAR(256),
  `birthdate` TIMESTAMP NULL,
  `country_code` VARCHAR(256),
  `workflow_state` VARCHAR(256),
  `sortable_name` VARCHAR(256)
) ENGINE = MyISAM DEFAULT CHARSET=utf8;
DROP TABLE IF EXISTS pseudonym_dim;
CREATE TABLE IF NOT EXISTS pseudonym_dim (
  `id` BIGINT PRIMARY KEY,
  `canvas_id` BIGINT,
  `user_id` BIGINT,
  `account_id` BIGINT,
  `workflow_state` VARCHAR(256),
  `last_request_at` TIMESTAMP NULL,
  `last_login_at` TIMESTAMP NULL,
  `current_login_at` TIMESTAMP NULL,
  `last_login_ip` VARCHAR(256),
  `current_login_ip` VARCHAR(256),
  `position` INTEGER UNSIGNED,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  `password_auto_generated` BOOLEAN,
  `deleted_at` TIMESTAMP NULL,
  `sis_user_id` VARCHAR(256),
  `unique_name` VARCHAR(256)
) ENGINE = MyISAM DEFAULT CHARSET=utf8;
DROP TABLE IF EXISTS pseudonym_fact;
CREATE TABLE IF NOT EXISTS pseudonym_fact (
  `pseudonym_id` BIGINT,
  `user_id` BIGINT,
  `account_id` BIGINT,
  `login_count` INTEGER UNSIGNED,
  `failed_login_count` INTEGER UNSIGNED
) ENGINE = MyISAM DEFAULT CHARSET=utf8;
DROP TABLE IF EXISTS assignment_dim;
CREATE TABLE IF NOT EXISTS assignment_dim (
  `id` BIGINT PRIMARY KEY,
  `canvas_id` BIGINT,
  `course_id` BIGINT,
  `title` VARCHAR(256),
  `description` LONGTEXT,
  `due_at` TIMESTAMP NULL,
  `unlock_at` TIMESTAMP NULL,
  `lock_at` TIMESTAMP NULL,
  `points_possible` DOUBLE,
  `grading_type` VARCHAR(256),
  `submission_types` VARCHAR(256),
  `workflow_state` VARCHAR(256),
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  `peer_review_count` INTEGER UNSIGNED,
  `peer_reviews_due_at` TIMESTAMP NULL,
  `peer_reviews_assigned` BOOLEAN,
  `peer_reviews` BOOLEAN,
  `automatic_peer_reviews` BOOLEAN,
  `all_day` BOOLEAN,
  `all_day_date` DATE,
  `could_be_locked` BOOLEAN,
  `grade_group_students_individually` BOOLEAN,
  `anonymous_peer_reviews` BOOLEAN,
  `muted` BOOLEAN,
  `assignment_group_id` BIGINT
) ENGINE = MyISAM DEFAULT CHARSET=utf8;
DROP TABLE IF EXISTS assignment_fact;
CREATE TABLE IF NOT EXISTS assignment_fact (
  `assignment_id` BIGINT,
  `course_id` BIGINT,
  `course_account_id` BIGINT,
  `enrollment_term_id` BIGINT,
  `points_possible` DOUBLE,
  `peer_review_count` INTEGER UNSIGNED,
  `assignment_group_id` BIGINT
) ENGINE = MyISAM DEFAULT CHARSET=utf8;
DROP TABLE IF EXISTS assignment_rule_dim;
CREATE TABLE IF NOT EXISTS assignment_rule_dim (
  `assignment_id` BIGINT,
  `drop_rule` VARCHAR(256)
) ENGINE = MyISAM DEFAULT CHARSET=utf8;
DROP TABLE IF EXISTS submission_dim;
CREATE TABLE IF NOT EXISTS submission_dim (
  `id` BIGINT PRIMARY KEY,
  `canvas_id` BIGINT,
  `body` LONGTEXT,
  `url` VARCHAR(256),
  `grade` VARCHAR(256),
  `submitted_at` TIMESTAMP NULL,
  `submission_type` ENUM('discussion_topic', 'external_tool', 'media_recording', 'online_file_upload', 'online_quiz', 'online_text_entry', 'online_upload', 'online_url'),
  `workflow_state` ENUM('graded', 'pending_review', 'submitted', 'unsubmitted'),
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  `processed` BOOLEAN,
  `process_attempts` INTEGER UNSIGNED,
  `grade_matches_current_submission` BOOLEAN,
  `published_grade` VARCHAR(256),
  `graded_at` TIMESTAMP NULL,
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
  `grade_state` ENUM('auto_graded', 'human_graded', 'not_graded')
) ENGINE = MyISAM DEFAULT CHARSET=utf8;
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
) ENGINE = MyISAM DEFAULT CHARSET=utf8;
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
) ENGINE = MyISAM DEFAULT CHARSET=utf8;
DROP TABLE IF EXISTS submission_comment_participant_dim;
CREATE TABLE IF NOT EXISTS submission_comment_participant_dim (
  `id` BIGINT PRIMARY KEY,
  `canvas_id` BIGINT,
  `participation_type` VARCHAR(256),
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL
) ENGINE = MyISAM DEFAULT CHARSET=utf8;
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
) ENGINE = MyISAM DEFAULT CHARSET=utf8;
DROP TABLE IF EXISTS submission_comment_dim;
CREATE TABLE IF NOT EXISTS submission_comment_dim (
  `id` BIGINT PRIMARY KEY,
  `canvas_id` BIGINT,
  `submission_id` BIGINT,
  `recipient_id` BIGINT,
  `author_id` BIGINT,
  `assessment_request_id` BIGINT,
  `group_comment_id` VARCHAR(256),
  `comment` LONGTEXT,
  `author_name` VARCHAR(256),
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  `anonymous` BOOLEAN,
  `teacher_only_comment` BOOLEAN,
  `hidden` BOOLEAN
) ENGINE = MyISAM DEFAULT CHARSET=utf8;
DROP TABLE IF EXISTS assignment_group_dim;
CREATE TABLE IF NOT EXISTS assignment_group_dim (
  `id` BIGINT PRIMARY KEY,
  `canvas_id` BIGINT,
  `course_id` BIGINT,
  `name` VARCHAR(256),
  `default_assignment_name` VARCHAR(256),
  `workflow_state` VARCHAR(256),
  `position` INTEGER UNSIGNED,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL
) ENGINE = MyISAM DEFAULT CHARSET=utf8;
DROP TABLE IF EXISTS assignment_group_fact;
CREATE TABLE IF NOT EXISTS assignment_group_fact (
  `assignment_group_id` BIGINT,
  `course_id` BIGINT,
  `group_weight` DOUBLE
) ENGINE = MyISAM DEFAULT CHARSET=utf8;
DROP TABLE IF EXISTS assignment_group_rule_dim;
CREATE TABLE IF NOT EXISTS assignment_group_rule_dim (
  `assignment_group_id` BIGINT,
  `drop_lowest` INTEGER UNSIGNED,
  `drop_highest` INTEGER UNSIGNED
) ENGINE = MyISAM DEFAULT CHARSET=utf8;
DROP TABLE IF EXISTS communication_channel_dim;
CREATE TABLE IF NOT EXISTS communication_channel_dim (
  `id` BIGINT PRIMARY KEY,
  `canvas_id` BIGINT,
  `user_id` BIGINT,
  `address` VARCHAR(256),
  `type` VARCHAR(256),
  `position` INTEGER UNSIGNED,
  `workflow_state` VARCHAR(256),
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL
) ENGINE = MyISAM DEFAULT CHARSET=utf8;
DROP TABLE IF EXISTS communication_channel_fact;
CREATE TABLE IF NOT EXISTS communication_channel_fact (
  `communication_channel_id` BIGINT,
  `user_id` BIGINT,
  `bounce_count` INTEGER UNSIGNED
) ENGINE = MyISAM DEFAULT CHARSET=utf8;
DROP TABLE IF EXISTS conversation_dim;
CREATE TABLE IF NOT EXISTS conversation_dim (
  `id` BIGINT PRIMARY KEY,
  `canvas_id` BIGINT,
  `has_attachments` BOOLEAN,
  `has_media_objects` BOOLEAN,
  `subject` VARCHAR(256),
  `course_id` BIGINT,
  `group_id` BIGINT,
  `account_id` BIGINT
) ENGINE = MyISAM DEFAULT CHARSET=utf8;
DROP TABLE IF EXISTS conversation_message_dim;
CREATE TABLE IF NOT EXISTS conversation_message_dim (
  `id` BIGINT PRIMARY KEY,
  `canvas_id` BIGINT,
  `conversation_id` BIGINT,
  `author_id` BIGINT,
  `created_at` TIMESTAMP NULL,
  `generated` BOOLEAN,
  `has_attachments` BOOLEAN,
  `has_media_objects` BOOLEAN,
  `body` LONGTEXT
) ENGINE = MyISAM DEFAULT CHARSET=utf8;
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
) ENGINE = MyISAM DEFAULT CHARSET=utf8;
DROP TABLE IF EXISTS discussion_topic_dim;
CREATE TABLE IF NOT EXISTS discussion_topic_dim (
  `id` BIGINT PRIMARY KEY,
  `canvas_id` BIGINT,
  `title` VARCHAR(256),
  `message` LONGTEXT,
  `type` VARCHAR(256),
  `workflow_state` VARCHAR(256),
  `last_reply_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  `delayed_post_at` TIMESTAMP NULL,
  `posted_at` TIMESTAMP NULL,
  `deleted_at` TIMESTAMP NULL,
  `discussion_type` VARCHAR(256),
  `pinned` BOOLEAN,
  `locked` BOOLEAN
) ENGINE = MyISAM DEFAULT CHARSET=utf8;
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
  `message_length` INTEGER UNSIGNED
) ENGINE = MyISAM DEFAULT CHARSET=utf8;
DROP TABLE IF EXISTS discussion_entry_dim;
CREATE TABLE IF NOT EXISTS discussion_entry_dim (
  `id` BIGINT PRIMARY KEY,
  `canvas_id` BIGINT,
  `message` LONGTEXT,
  `workflow_state` VARCHAR(256),
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  `deleted_at` TIMESTAMP NULL,
  `depth` INTEGER UNSIGNED
) ENGINE = MyISAM DEFAULT CHARSET=utf8;
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
) ENGINE = MyISAM DEFAULT CHARSET=utf8;
DROP TABLE IF EXISTS enrollment_term_dim;
CREATE TABLE IF NOT EXISTS enrollment_term_dim (
  `id` BIGINT PRIMARY KEY,
  `canvas_id` BIGINT,
  `root_account_id` BIGINT,
  `name` VARCHAR(256),
  `date_start` TIMESTAMP NULL,
  `date_end` TIMESTAMP NULL,
  `sis_source_id` VARCHAR(256)
) ENGINE = MyISAM DEFAULT CHARSET=utf8;
DROP TABLE IF EXISTS course_section_dim;
CREATE TABLE IF NOT EXISTS course_section_dim (
  `id` BIGINT PRIMARY KEY,
  `canvas_id` BIGINT,
  `name` VARCHAR(256),
  `course_id` BIGINT,
  `enrollment_term_id` BIGINT,
  `default_section` BOOLEAN,
  `accepting_enrollments` BOOLEAN,
  `can_manually_enroll` BOOLEAN,
  `start_at` TIMESTAMP NULL,
  `end_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  `workflow_state` VARCHAR(256),
  `restrict_enrollments_to_section_dates` BOOLEAN,
  `nonxlist_course_id` BIGINT,
  `sis_source_id` VARCHAR(256)
) ENGINE = MyISAM DEFAULT CHARSET=utf8;
DROP TABLE IF EXISTS role_dim;
CREATE TABLE IF NOT EXISTS role_dim (
  `id` BIGINT PRIMARY KEY,
  `canvas_id` BIGINT,
  `root_account_id` BIGINT,
  `account_id` BIGINT,
  `name` VARCHAR(256),
  `base_role_type` VARCHAR(256),
  `workflow_state` VARCHAR(256),
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  `deleted_at` TIMESTAMP NULL
) ENGINE = MyISAM DEFAULT CHARSET=utf8;
DROP TABLE IF EXISTS enrollment_dim;
CREATE TABLE IF NOT EXISTS enrollment_dim (
  `id` BIGINT PRIMARY KEY,
  `canvas_id` BIGINT,
  `root_account_id` BIGINT,
  `course_section_id` BIGINT,
  `role_id` BIGINT,
  `type` VARCHAR(256),
  `workflow_state` VARCHAR(256),
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  `start_at` TIMESTAMP NULL,
  `end_at` TIMESTAMP NULL,
  `completed_at` TIMESTAMP NULL,
  `self_enrolled` BOOLEAN,
  `sis_source_id` VARCHAR(256),
  `course_id` BIGINT,
  `user_id` BIGINT
) ENGINE = MyISAM DEFAULT CHARSET=utf8;
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
) ENGINE = MyISAM DEFAULT CHARSET=utf8;
DROP TABLE IF EXISTS enrollment_rollup_dim;
CREATE TABLE IF NOT EXISTS enrollment_rollup_dim (
  `id` BIGINT PRIMARY KEY,
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
  `least_privileged_role` VARCHAR(256)
) ENGINE = MyISAM DEFAULT CHARSET=utf8;
DROP TABLE IF EXISTS group_dim;
CREATE TABLE IF NOT EXISTS group_dim (
  `id` BIGINT PRIMARY KEY,
  `canvas_id` BIGINT,
  `name` VARCHAR(256),
  `description` LONGTEXT,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  `deleted_at` TIMESTAMP NULL,
  `is_public` BOOLEAN,
  `workflow_state` VARCHAR(256),
  `context_type` VARCHAR(256),
  `category` LONGTEXT,
  `join_level` VARCHAR(256),
  `default_view` VARCHAR(256),
  `sis_source_id` BIGINT,
  `group_category_id` BIGINT,
  `account_id` BIGINT,
  `wiki_id` BIGINT
) ENGINE = MyISAM DEFAULT CHARSET=utf8;
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
) ENGINE = MyISAM DEFAULT CHARSET=utf8;
DROP TABLE IF EXISTS group_membership_fact;
CREATE TABLE IF NOT EXISTS group_membership_fact (
  `group_id` BIGINT,
  `parent_course_id` BIGINT,
  `parent_account_id` BIGINT,
  `parent_course_account_id` BIGINT,
  `enrollment_term_id` BIGINT,
  `user_id` BIGINT
) ENGINE = MyISAM DEFAULT CHARSET=utf8;
DROP TABLE IF EXISTS course_ui_canvas_navigation_dim;
CREATE TABLE IF NOT EXISTS course_ui_canvas_navigation_dim (
  `id` BIGINT PRIMARY KEY,
  `canvas_id` BIGINT,
  `name` VARCHAR(256),
  `default` VARCHAR(256),
  `original_position` VARCHAR(256)
) ENGINE = MyISAM DEFAULT CHARSET=utf8;
DROP TABLE IF EXISTS course_ui_navigation_item_dim;
CREATE TABLE IF NOT EXISTS course_ui_navigation_item_dim (
  `id` BIGINT PRIMARY KEY,
  `root_account_id` BIGINT,
  `visible` VARCHAR(256),
  `position` INTEGER UNSIGNED
) ENGINE = MyISAM DEFAULT CHARSET=utf8;
DROP TABLE IF EXISTS course_ui_navigation_item_fact;
CREATE TABLE IF NOT EXISTS course_ui_navigation_item_fact (
  `root_account_id` BIGINT,
  `course_ui_navigation_item_id` BIGINT,
  `course_ui_canvas_navigation_id` BIGINT,
  `external_tool_activation_id` BIGINT,
  `course_id` BIGINT,
  `course_account_id` BIGINT,
  `enrollment_term_id` BIGINT
) ENGINE = MyISAM DEFAULT CHARSET=utf8;
DROP TABLE IF EXISTS quiz_dim;
CREATE TABLE IF NOT EXISTS quiz_dim (
  `id` BIGINT PRIMARY KEY,
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
  `show_correct_answers_at` TIMESTAMP NULL,
  `hide_correct_answers_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  `published_at` TIMESTAMP NULL,
  `unlock_at` TIMESTAMP NULL,
  `lock_at` TIMESTAMP NULL,
  `due_at` TIMESTAMP NULL,
  `deleted_at` TIMESTAMP NULL
) ENGINE = MyISAM DEFAULT CHARSET=utf8;
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
) ENGINE = MyISAM DEFAULT CHARSET=utf8;
DROP TABLE IF EXISTS quiz_submission_historical_dim;
CREATE TABLE IF NOT EXISTS quiz_submission_historical_dim (
  `id` BIGINT PRIMARY KEY,
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
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  `started_at` TIMESTAMP NULL,
  `finished_at` TIMESTAMP NULL,
  `due_at` TIMESTAMP NULL
) ENGINE = MyISAM DEFAULT CHARSET=utf8;
DROP TABLE IF EXISTS quiz_submission_historical_fact;
CREATE TABLE IF NOT EXISTS quiz_submission_historical_fact (
  `score` DOUBLE,
  `kept_score` DOUBLE,
  `date` TIMESTAMP NULL,
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
) ENGINE = MyISAM DEFAULT CHARSET=utf8;
DROP TABLE IF EXISTS quiz_submission_dim;
CREATE TABLE IF NOT EXISTS quiz_submission_dim (
  `id` BIGINT PRIMARY KEY,
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
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  `started_at` TIMESTAMP NULL,
  `finished_at` TIMESTAMP NULL,
  `due_at` TIMESTAMP NULL
) ENGINE = MyISAM DEFAULT CHARSET=utf8;
DROP TABLE IF EXISTS quiz_submission_fact;
CREATE TABLE IF NOT EXISTS quiz_submission_fact (
  `score` DOUBLE,
  `kept_score` DOUBLE,
  `date` TIMESTAMP NULL,
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
) ENGINE = MyISAM DEFAULT CHARSET=utf8;
DROP TABLE IF EXISTS quiz_question_group_dim;
CREATE TABLE IF NOT EXISTS quiz_question_group_dim (
  `id` BIGINT PRIMARY KEY,
  `canvas_id` BIGINT,
  `quiz_id` BIGINT,
  `name` VARCHAR(256),
  `position` INTEGER UNSIGNED,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL
) ENGINE = MyISAM DEFAULT CHARSET=utf8;
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
) ENGINE = MyISAM DEFAULT CHARSET=utf8;
DROP TABLE IF EXISTS quiz_question_dim;
CREATE TABLE IF NOT EXISTS quiz_question_dim (
  `id` BIGINT PRIMARY KEY,
  `canvas_id` BIGINT,
  `quiz_id` BIGINT,
  `quiz_question_group_id` BIGINT,
  `position` INTEGER UNSIGNED,
  `workflow_state` VARCHAR(256),
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  `assessment_question_id` BIGINT,
  `assessment_question_version` INTEGER UNSIGNED,
  `name` VARCHAR(256),
  `question_type` VARCHAR(256),
  `question_text` LONGTEXT,
  `regrade_option` VARCHAR(256),
  `correct_comments` LONGTEXT,
  `incorrect_comments` LONGTEXT,
  `neutral_comments` LONGTEXT
) ENGINE = MyISAM DEFAULT CHARSET=utf8;
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
) ENGINE = MyISAM DEFAULT CHARSET=utf8;
DROP TABLE IF EXISTS quiz_question_answer_dim;
CREATE TABLE IF NOT EXISTS quiz_question_answer_dim (
  `id` BIGINT PRIMARY KEY,
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
  `ending_range` DOUBLE
) ENGINE = MyISAM DEFAULT CHARSET=utf8;
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
) ENGINE = MyISAM DEFAULT CHARSET=utf8;
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
  `web_applicaiton_action` VARCHAR(256),
  `web_application_context_type` VARCHAR(256),
  `web_application_context_id` VARCHAR(256),
  `real_user_id` BIGINT,
  `session_id` VARCHAR(256),
  `user_agent_id` BIGINT,
  `http_status` VARCHAR(10),
  `http_version` VARCHAR(256)
) ENGINE = MyISAM DEFAULT CHARSET=utf8;
DROP TABLE IF EXISTS external_tool_activation_dim;
CREATE TABLE IF NOT EXISTS external_tool_activation_dim (
  `id` BIGINT PRIMARY KEY,
  `canvas_id` BIGINT,
  `course_id` BIGINT,
  `account_id` BIGINT,
  `activation_target_type` VARCHAR(256),
  `url` VARCHAR(4096),
  `name` VARCHAR(256),
  `description` VARCHAR(256),
  `workflow_state` VARCHAR(256),
  `privacy_level` VARCHAR(256),
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  `tool_id` VARCHAR(256),
  `selectable_all` BOOLEAN
) ENGINE = MyISAM DEFAULT CHARSET=utf8;
DROP TABLE IF EXISTS external_tool_activation_fact;
CREATE TABLE IF NOT EXISTS external_tool_activation_fact (
  `external_tool_activation_id` BIGINT,
  `course_id` BIGINT,
  `account_id` BIGINT,
  `root_account_id` BIGINT,
  `enrollment_term_id` BIGINT,
  `course_account_id` BIGINT
) ENGINE = MyISAM DEFAULT CHARSET=utf8;
DROP TABLE IF EXISTS wiki_dim;
CREATE TABLE IF NOT EXISTS wiki_dim (
  `id` BIGINT PRIMARY KEY,
  `canvas_id` BIGINT,
  `parent_type` VARCHAR(256),
  `title` LONGTEXT,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  `front_page_url` LONGTEXT,
  `has_no_front_page` BOOLEAN
) ENGINE = MyISAM DEFAULT CHARSET=utf8;
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
) ENGINE = MyISAM DEFAULT CHARSET=utf8;
DROP TABLE IF EXISTS wiki_page_dim;
CREATE TABLE IF NOT EXISTS wiki_page_dim (
  `id` BIGINT PRIMARY KEY,
  `canvas_id` BIGINT,
  `title` VARCHAR(256),
  `body` LONGTEXT,
  `workflow_state` VARCHAR(256),
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  `url` LONGTEXT,
  `protected_editing` BOOLEAN,
  `editing_roles` VARCHAR(256),
  `revised_at` TIMESTAMP NULL,
  `could_be_locked` BOOLEAN
) ENGINE = MyISAM DEFAULT CHARSET=utf8;
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
) ENGINE = MyISAM DEFAULT CHARSET=utf8;
