
CREATE TABLE IF NOT EXISTS parking_incharge (
	id SERIAL NOT NULL,
    first_name TEXT NOT NULL,
    middle_name TEXT,
    last_name TEXT NOT NULL,
    age TEXT NOT NULL,
    blood_grp TEXT NOT NULL,
    mobile_no TEXT NOT NULL,
    emergency_mob_no TEXT,
	address TEXT,
	zip_code TEXT,
    email_id TEXT,
    cunique_id VARCHAR NOT NULL,
    kyc_doc TEXT,
    fitness_doc TEXT,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL,
	UNIQUE (cunique_id, email_id),
    CONSTRAINT "parking_incharge_pkey" PRIMARY KEY ("id")
);


CREATE TYPE type_parking_space AS ENUM ('A', 'B');

CREATE TABLE IF NOT EXISTS parking_area (
	id SERIAL NOT NULL,
    address TEXT NOT NULL,
    zip_code TEXT NOT NULL,
    station TEXT NOT NULL,
    landmark TEXT NOT NULL,
    two_wheeler_capacity INT NOT NULL,
	four_wheeler_capacity INT NOT NULL,
    total_parking_area INT,
    agreement_doc TEXT,
	type_parking_space type_parking_space,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parking_area_pkey" PRIMARY KEY ("id")
);



CREATE TABLE IF NOT EXISTS scheduler (
	id SERIAL NOT NULL,
	incharge_id TEXT,
	location_id TEXT,
	zip_code TEXT,
	from_date DATE NOT NULL DEFAULT CURRENT_DATE,
	to_date DATE NOT NULL DEFAULT CURRENT_DATE,
	from_time INT,
	to_time INT,
	created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP(3) NOT NULL,
	CONSTRAINT "scheduler_area_pkey" PRIMARY KEY ("id")
);






