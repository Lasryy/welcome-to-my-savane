const pool = require("../db/pool");

async function getAds(req, res){
    try {
        const result = await pool.query(
        `
        SELECT
            ads.id,
            ads.title,
            ads.short_description,
            ads.description,
            ads.location,
            ads.salary,
            ads.contract_type,
            ads.working_time,
            ads.status,
            ads.created_at,

            companies.id AS company_id,
            companies.name AS company_name,

            categories.id AS category_id,
            categories.name AS category_name

        FROM ads

        JOIN companies
            ON ads.company_id = companies.id

        LEFT JOIN categories
            ON ads.category_id = categories.id

        WHERE ads.status = $1

        ORDER BY ads.created_at DESC
        `,
        ["published"]
        );


    return res.status(200).json(result.rows);

    } catch (error) {
        console.error("Error while fetching ads:", error);
        
        return res.status(500).json({
            error: "Internal server error",
        });
    }
}

async function getAdsById(req, res){

    try {

        const {id} = req.params;

        const result = await pool.query(
        `    
        SELECT
            ads.id,
            ads.title,
            ads.short_description,
            ads.description,
            ads.location,
            ads.salary,
            ads.contract_type,
            ads.working_time,
            ads.status,
            ads.created_at,

        companies.id AS company_id,
        companies.name AS company_name,

        categories.id AS category_id,
        categories.name AS category_name

        FROM ads

        JOIN companies
            ON ads.company_id = companies.id

        LEFT JOIN categories
            ON ads.category_id = categories.id

        WHERE ads.id = $1
        AND ads.status = 'published';
        `,
        [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Annonce introuvable"
            });
        }

        return res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error("Error while fetching ad:", error);

        return res.status(500).json({
            error: "Internal server error"
        });
    }
}



module.exports = {
    getAds,
    getAdsById,
};
