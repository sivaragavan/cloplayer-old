
# --- !Ups

create table article (
  id                        varchar(40) not null,
  url                       varchar(255),
  title                  varchar(255),
  text                    varchar(10000),
  json_res                    varchar(10000),
  total_length              integer,
  download_length           integer,
  constraint pk_article primary key (id))
;




# --- !Downs

drop table if exists article;

