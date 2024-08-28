CREATE TABLE IF NOT EXISTS main.plan_items
(
    id uuid NOT NULL DEFAULT (md5(((random())::text || (clock_timestamp())::text)))::uuid,
    created_on timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_on timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted boolean NOT NULL DEFAULT false,
    deleted_on timestamp with time zone,
    deleted_by uuid,
    created_by uuid NOT NULL,
    modified_by uuid,
    name character varying(100) COLLATE pg_catalog."default" NOT NULL,
    plan_item_type character varying(30) COLLATE pg_catalog."default" NOT NULL,
    plan_id uuid NOT NULL,
    value jsonb NOT NULL,
    CONSTRAINT pk_plan_items_id PRIMARY KEY (id),
    CONSTRAINT fk_plan_items_plan_id FOREIGN KEY (plan_id)
        REFERENCES main.plans (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT fk_plan_items_plans FOREIGN KEY (plan_id)
        REFERENCES main.plans (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)