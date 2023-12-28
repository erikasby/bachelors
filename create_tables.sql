--
-- PostgreSQL database dump
--

-- Dumped from database version 16.0
-- Dumped by pg_dump version 16.0

-- Started on 2023-12-18 18:16:52

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 218 (class 1259 OID 16409)
-- Name: communities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.communities (
    community_id integer NOT NULL,
    name character varying(40) NOT NULL,
    follows_count integer DEFAULT 1 NOT NULL,
    posts_count integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    is_deleted boolean DEFAULT false NOT NULL,
    deleted_response character varying(500),
    comments_count integer DEFAULT 0 NOT NULL,
    name_for_display character varying(40) NOT NULL
);


ALTER TABLE public.communities OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 16452)
-- Name: communities_accesses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.communities_accesses (
    access_id integer NOT NULL,
    community_id integer NOT NULL,
    user_id integer NOT NULL,
    can_ban_users boolean DEFAULT false NOT NULL,
    can_delete_comments boolean DEFAULT false NOT NULL,
    can_delete_posts boolean DEFAULT false NOT NULL,
    can_delete_community boolean DEFAULT false NOT NULL,
    can_update_community boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    is_deleted boolean DEFAULT false NOT NULL,
    is_admin boolean DEFAULT false NOT NULL
);


ALTER TABLE public.communities_accesses OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 16657)
-- Name: communities_bans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.communities_bans (
    ban_id integer NOT NULL,
    community_id integer NOT NULL,
    user_id integer NOT NULL,
    banned_until timestamp without time zone NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    banned_response character varying(500)
);


ALTER TABLE public.communities_bans OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 16656)
-- Name: communities_bans_ban_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.communities_bans ALTER COLUMN ban_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.communities_bans_ban_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 230 (class 1259 OID 16518)
-- Name: communities_bookmarks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.communities_bookmarks (
    bookmark_id integer NOT NULL,
    post_id integer NOT NULL,
    user_id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    is_deleted boolean DEFAULT false NOT NULL
);


ALTER TABLE public.communities_bookmarks OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 16554)
-- Name: communities_comments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.communities_comments (
    comment_id integer NOT NULL,
    post_id integer NOT NULL,
    user_id integer NOT NULL,
    replied_to_comment_id integer,
    text character varying(1000) NOT NULL,
    votes_count integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    is_deleted boolean DEFAULT false NOT NULL,
    deleted_response character varying(500),
    depth integer DEFAULT 0 NOT NULL,
    edited_text character varying(1000),
    parent_comment_id integer
);


ALTER TABLE public.communities_comments OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 16594)
-- Name: communities_comments_votes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.communities_comments_votes (
    vote_id integer NOT NULL,
    comment_id integer NOT NULL,
    user_id integer NOT NULL,
    sign integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.communities_comments_votes OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 16408)
-- Name: communities_community_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.communities ALTER COLUMN community_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.communities_community_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 232 (class 1259 OID 16533)
-- Name: communities_follows; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.communities_follows (
    follow_id integer NOT NULL,
    community_id integer NOT NULL,
    user_id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    is_deleted boolean DEFAULT false NOT NULL
);


ALTER TABLE public.communities_follows OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 16421)
-- Name: communities_posts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.communities_posts (
    post_id integer NOT NULL,
    community_id integer NOT NULL,
    user_id integer NOT NULL,
    title character varying(50) NOT NULL,
    text character varying(10000) NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    is_deleted boolean DEFAULT false NOT NULL,
    deleted_response character varying(500),
    votes_count integer DEFAULT 0 NOT NULL,
    comments_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.communities_posts OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16517)
-- Name: communities_posts_bookmarks_bookmark_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.communities_bookmarks ALTER COLUMN bookmark_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.communities_posts_bookmarks_bookmark_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 219 (class 1259 OID 16420)
-- Name: communities_posts_post_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.communities_posts ALTER COLUMN post_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.communities_posts_post_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 226 (class 1259 OID 16477)
-- Name: communities_tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.communities_tags (
    tag_id integer NOT NULL,
    post_id integer NOT NULL,
    name character varying(30) NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    is_deleted boolean DEFAULT false NOT NULL
);


ALTER TABLE public.communities_tags OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16476)
-- Name: communities_posts_tags_tag_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.communities_tags ALTER COLUMN tag_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.communities_posts_tags_tag_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 228 (class 1259 OID 16503)
-- Name: communities_posts_votes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.communities_posts_votes (
    vote_id integer NOT NULL,
    post_id integer NOT NULL,
    user_id integer NOT NULL,
    sign integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.communities_posts_votes OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16502)
-- Name: communities_posts_votes_vote_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.communities_posts_votes ALTER COLUMN vote_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.communities_posts_votes_vote_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 223 (class 1259 OID 16451)
-- Name: communities_users_accesses_access_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.communities_accesses ALTER COLUMN access_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.communities_users_accesses_access_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 231 (class 1259 OID 16532)
-- Name: communities_users_follows_follow_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.communities_follows ALTER COLUMN follow_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.communities_users_follows_follow_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 233 (class 1259 OID 16553)
-- Name: communities_users_posts_comments_comment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.communities_comments ALTER COLUMN comment_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.communities_users_posts_comments_comment_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 235 (class 1259 OID 16593)
-- Name: communities_users_posts_comments_votes_vote_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.communities_comments_votes ALTER COLUMN vote_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.communities_users_posts_comments_votes_vote_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 215 (class 1259 OID 16399)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    username character varying(30) NOT NULL,
    password character varying(72) NOT NULL,
    email character varying(50) NOT NULL,
    first_name character varying(40),
    last_name character varying(40),
    gender character varying(15),
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    is_deleted boolean DEFAULT false NOT NULL,
    deleted_response character varying(500),
    username_for_display character varying(30),
    posts_count integer DEFAULT 0 NOT NULL,
    follows_count integer DEFAULT 0 NOT NULL,
    comments_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16441)
-- Name: users_accesses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users_accesses (
    access_id integer NOT NULL,
    user_id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    is_deleted boolean DEFAULT false NOT NULL,
    can_ban_users boolean DEFAULT false NOT NULL
);


ALTER TABLE public.users_accesses OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16440)
-- Name: users_accesses_access_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.users_accesses ALTER COLUMN access_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.users_accesses_access_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 238 (class 1259 OID 16644)
-- Name: users_bans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users_bans (
    ban_id integer NOT NULL,
    user_id integer NOT NULL,
    banned_until timestamp without time zone NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    banned_response character varying(500)
);


ALTER TABLE public.users_bans OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 16643)
-- Name: users_bans_ban_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.users_bans ALTER COLUMN ban_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.users_bans_ban_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 216 (class 1259 OID 16407)
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.users ALTER COLUMN user_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.users_user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 4789 (class 2606 OID 16489)
-- Name: communities_accesses communities_accesses_access_id_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.communities_accesses
    ADD CONSTRAINT communities_accesses_access_id_pk PRIMARY KEY (access_id);


--
-- TOC entry 4805 (class 2606 OID 16663)
-- Name: communities_bans communities_bans_ban_id_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.communities_bans
    ADD CONSTRAINT communities_bans_ban_id_pk PRIMARY KEY (ban_id);


--
-- TOC entry 4795 (class 2606 OID 16548)
-- Name: communities_bookmarks communities_bookmarks_bookmark_id_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.communities_bookmarks
    ADD CONSTRAINT communities_bookmarks_bookmark_id_pk PRIMARY KEY (bookmark_id);


--
-- TOC entry 4799 (class 2606 OID 16562)
-- Name: communities_comments communities_comments_comment_id_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.communities_comments
    ADD CONSTRAINT communities_comments_comment_id_pk PRIMARY KEY (comment_id);


--
-- TOC entry 4801 (class 2606 OID 16599)
-- Name: communities_comments_votes communities_comments_votes_vote_id_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.communities_comments_votes
    ADD CONSTRAINT communities_comments_votes_vote_id_pk PRIMARY KEY (vote_id);


--
-- TOC entry 4781 (class 2606 OID 16418)
-- Name: communities communities_community_id_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.communities
    ADD CONSTRAINT communities_community_id_pk PRIMARY KEY (community_id);


--
-- TOC entry 4797 (class 2606 OID 16552)
-- Name: communities_follows communities_follows_follow_id_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.communities_follows
    ADD CONSTRAINT communities_follows_follow_id_pk PRIMARY KEY (follow_id);


--
-- TOC entry 4783 (class 2606 OID 40962)
-- Name: communities communities_name_uq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.communities
    ADD CONSTRAINT communities_name_uq UNIQUE (name);


--
-- TOC entry 4785 (class 2606 OID 16428)
-- Name: communities_posts communities_posts_post_id_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.communities_posts
    ADD CONSTRAINT communities_posts_post_id_pk PRIMARY KEY (post_id);


--
-- TOC entry 4793 (class 2606 OID 16550)
-- Name: communities_posts_votes communities_posts_votes_vote_id_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.communities_posts_votes
    ADD CONSTRAINT communities_posts_votes_vote_id_pk PRIMARY KEY (vote_id);


--
-- TOC entry 4791 (class 2606 OID 16491)
-- Name: communities_tags communities_tags_tag_id_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.communities_tags
    ADD CONSTRAINT communities_tags_tag_id_pk PRIMARY KEY (tag_id);


--
-- TOC entry 4787 (class 2606 OID 16487)
-- Name: users_accesses users_accesses_access_id_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users_accesses
    ADD CONSTRAINT users_accesses_access_id_pk PRIMARY KEY (access_id);


--
-- TOC entry 4803 (class 2606 OID 16650)
-- Name: users_bans users_bans_ban_id_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users_bans
    ADD CONSTRAINT users_bans_ban_id_pk PRIMARY KEY (ban_id);


--
-- TOC entry 4775 (class 2606 OID 24579)
-- Name: users users_email_uq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_uq UNIQUE (email);


--
-- TOC entry 4777 (class 2606 OID 16406)
-- Name: users users_user_id_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_user_id_pk PRIMARY KEY (user_id);


--
-- TOC entry 4779 (class 2606 OID 24577)
-- Name: users users_username_uq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_uq UNIQUE (username);


--
-- TOC entry 4809 (class 2606 OID 16466)
-- Name: communities_accesses communities_accesses_communities_community_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.communities_accesses
    ADD CONSTRAINT communities_accesses_communities_community_id_fk FOREIGN KEY (community_id) REFERENCES public.communities(community_id);


--
-- TOC entry 4810 (class 2606 OID 16461)
-- Name: communities_accesses communities_accesses_users_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.communities_accesses
    ADD CONSTRAINT communities_accesses_users_user_id_fk FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- TOC entry 4825 (class 2606 OID 16669)
-- Name: communities_bans communities_bans_communities_community_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.communities_bans
    ADD CONSTRAINT communities_bans_communities_community_id_fk FOREIGN KEY (community_id) REFERENCES public.communities(community_id);


--
-- TOC entry 4826 (class 2606 OID 16664)
-- Name: communities_bans communities_bans_users_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.communities_bans
    ADD CONSTRAINT communities_bans_users_user_id_fk FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- TOC entry 4814 (class 2606 OID 16522)
-- Name: communities_bookmarks communities_bookmarks_communities_posts_post_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.communities_bookmarks
    ADD CONSTRAINT communities_bookmarks_communities_posts_post_id_fk FOREIGN KEY (post_id) REFERENCES public.communities_posts(post_id);


--
-- TOC entry 4815 (class 2606 OID 16527)
-- Name: communities_bookmarks communities_bookmarks_users_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.communities_bookmarks
    ADD CONSTRAINT communities_bookmarks_users_user_id_fk FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- TOC entry 4818 (class 2606 OID 40992)
-- Name: communities_comments communities_comments_communities_comments_parent_comment_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.communities_comments
    ADD CONSTRAINT communities_comments_communities_comments_parent_comment_id_fk FOREIGN KEY (parent_comment_id) REFERENCES public.communities_comments(comment_id) NOT VALID;


--
-- TOC entry 4819 (class 2606 OID 16583)
-- Name: communities_comments communities_comments_communities_comments_replied_to_comment_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.communities_comments
    ADD CONSTRAINT communities_comments_communities_comments_replied_to_comment_id FOREIGN KEY (replied_to_comment_id) REFERENCES public.communities_comments(comment_id);


--
-- TOC entry 4820 (class 2606 OID 16578)
-- Name: communities_comments communities_comments_communities_posts_post_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.communities_comments
    ADD CONSTRAINT communities_comments_communities_posts_post_id_fk FOREIGN KEY (post_id) REFERENCES public.communities_posts(post_id);


--
-- TOC entry 4821 (class 2606 OID 16563)
-- Name: communities_comments communities_comments_users_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.communities_comments
    ADD CONSTRAINT communities_comments_users_user_id_fk FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- TOC entry 4822 (class 2606 OID 16600)
-- Name: communities_comments_votes communities_comments_votes_communities_comments_comment_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.communities_comments_votes
    ADD CONSTRAINT communities_comments_votes_communities_comments_comment_id_fk FOREIGN KEY (comment_id) REFERENCES public.communities_comments(comment_id);


--
-- TOC entry 4823 (class 2606 OID 16610)
-- Name: communities_comments_votes communities_comments_votes_users_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.communities_comments_votes
    ADD CONSTRAINT communities_comments_votes_users_user_id_fk FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- TOC entry 4816 (class 2606 OID 16537)
-- Name: communities_follows communities_follows_communities_community_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.communities_follows
    ADD CONSTRAINT communities_follows_communities_community_id_fk FOREIGN KEY (community_id) REFERENCES public.communities(community_id);


--
-- TOC entry 4817 (class 2606 OID 16542)
-- Name: communities_follows communities_follows_users_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.communities_follows
    ADD CONSTRAINT communities_follows_users_user_id_fk FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- TOC entry 4806 (class 2606 OID 16429)
-- Name: communities_posts communities_posts_communities_community_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.communities_posts
    ADD CONSTRAINT communities_posts_communities_community_id_fk FOREIGN KEY (community_id) REFERENCES public.communities(community_id);


--
-- TOC entry 4807 (class 2606 OID 16434)
-- Name: communities_posts communities_posts_users_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.communities_posts
    ADD CONSTRAINT communities_posts_users_user_id_fk FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- TOC entry 4812 (class 2606 OID 16507)
-- Name: communities_posts_votes communities_posts_votes_communities_posts_post_id_f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.communities_posts_votes
    ADD CONSTRAINT communities_posts_votes_communities_posts_post_id_f FOREIGN KEY (post_id) REFERENCES public.communities_posts(post_id);


--
-- TOC entry 4813 (class 2606 OID 16512)
-- Name: communities_posts_votes communities_posts_votes_users_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.communities_posts_votes
    ADD CONSTRAINT communities_posts_votes_users_user_id_fk FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- TOC entry 4811 (class 2606 OID 16481)
-- Name: communities_tags communities_tags_communities_posts_post_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.communities_tags
    ADD CONSTRAINT communities_tags_communities_posts_post_id_fk FOREIGN KEY (post_id) REFERENCES public.communities_posts(post_id);


--
-- TOC entry 4808 (class 2606 OID 16446)
-- Name: users_accesses users_accesses_users_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users_accesses
    ADD CONSTRAINT users_accesses_users_user_id_fk FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- TOC entry 4824 (class 2606 OID 16651)
-- Name: users_bans users_bans_users_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users_bans
    ADD CONSTRAINT users_bans_users_user_id_fk FOREIGN KEY (user_id) REFERENCES public.users(user_id);


-- Completed on 2023-12-18 18:16:52

--
-- PostgreSQL database dump complete
--

