CREATE TABLE IF NOT EXISTS main.features (
	id                   uuid DEFAULT md5(random()::text || clock_timestamp()::text)::uuid NOT NULL,
	name            	 text  NOT NULL ,
	key            		 text  NOT NULL ,
	description        	 text ,
	default_value        text ,
	type		 		 text ,
    metadata TEXT,  
    created_by varchar(100),
    modified_by varchar(100),
    created_on           timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL ,
    modified_on          timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL ,
    deleted              bool DEFAULT false NOT NULL ,
    deleted_on           timestamptz   ,
    deleted_by           uuid,
	CONSTRAINT pk_features_id PRIMARY KEY ( id )
 );

 CREATE TABLE IF NOT EXISTS main.strategies (
	id                   uuid DEFAULT md5(random()::text || clock_timestamp()::text)::uuid NOT NULL,
	name            	 text  NOT NULL ,
	key            		 text  NOT NULL ,
	priority        	 integer ,
    created_by varchar(100),
    modified_by varchar(100),
    created_on           timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL ,
    modified_on          timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL ,
    deleted              bool DEFAULT false NOT NULL ,
    deleted_on           timestamptz   ,
    deleted_by           uuid,
	CONSTRAINT pk_strategies_id PRIMARY KEY ( id )
 );

 CREATE TABLE IF NOT EXISTS main.feature_values (
	id                   	uuid DEFAULT md5(random()::text || clock_timestamp()::text)::uuid NOT NULL,
	feature_key             varchar(50)  NOT NULL ,
	strategy_key            varchar(50)  NOT NULL ,
    strategy_entity_id      uuid NULL,
	status         			bool DEFAULT true NOT NULL ,
	value 	             	text,
    created_by varchar(100),
    modified_by varchar(100),
    created_on           timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL ,
    modified_on          timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL ,
    deleted              bool DEFAULT false NOT NULL ,
    deleted_on           timestamptz   ,
    deleted_by           uuid,
	CONSTRAINT pk_feature_values_id PRIMARY KEY ( id )
 );

INSERT INTO main.strategies(name, key, priority)
	VALUES ('System', 'System', '1');

INSERT INTO main.strategies(name, key, priority)
	VALUES ('Tenant', 'Tenant', '2');

INSERT INTO main.strategies(name, key, priority)
	VALUES ('User', 'User', '3');
INSERT INTO main.strategies(name, key, priority)
	VALUES ('Plan', 'Plan', '4');