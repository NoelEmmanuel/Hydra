import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://nyqewpdzyvciykyjxtes.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55cWV3cGR6eXZjaXlreWp4dGVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2NTY3MDYsImV4cCI6MjA3ODIzMjcwNn0.avAbfV5xq9r5K5mUN9QMWMhlz0mj8yE4K8WHnEm7o-A")

# Create Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Export for use in other modules
__all__ = ["supabase", "SUPABASE_URL", "SUPABASE_KEY"]

