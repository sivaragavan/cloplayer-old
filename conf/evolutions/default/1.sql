# --- Created by Ebean DDL
# To stop Ebean DDL generation, remove this comment and start using Evolutions

# --- !Ups

create table article (
  id                        varchar(40) not null,
  url                       varchar(255),
  headline                  varchar(255),
  detail                    varchar(255),
  total_length              integer,
  download_length           integer,
  constraint pk_article primary key (id))
;




# --- !Downs

SET REFERENTIAL_INTEGRITY FALSE;

drop table if exists article;

SET REFERENTIAL_INTEGRITY TRUE;

