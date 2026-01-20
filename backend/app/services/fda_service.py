import httpx

class FDAService:
    BASE_URL = "https://api.fda.gov/drug/label.json"

    @staticmethod
    async def get_drug_details(drug_name: str) -> dict:
        """
        Queries OpenFDA to get official labeling info (warnings, usage, active ingredients).
        """
        try:
            # We search for the brand name. 
            # quotes around the name allow for exact phrase matching.
            query = f'openfda.brand_name:"{drug_name}"'
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    FDAService.BASE_URL, 
                    params={"search": query, "limit": 1}
                )
                
            if response.status_code == 200:
                data = response.json()
                if "results" in data:
                    result = data["results"][0]
                    # We extract just the useful bits to avoid overloading the AI context
                    return {
                        "generic_name": result.get("openfda", {}).get("generic_name", ["Unknown"])[0],
                        "purpose": result.get("purpose", ["Unknown"])[0],
                        "warnings": result.get("warnings", ["No specific warnings found."])[0][:500], # Limit text length
                        "dosage_instructions": result.get("dosage_and_administration", ["Unknown"])[0][:500]
                    }
            return {"error": "Drug not found in FDA database"}
            
        except Exception as e:
            return {"error": f"FDA API Connection Failed: {str(e)}"}