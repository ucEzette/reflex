import os
import subprocess
import time

def run_cmd(cmd):
    return subprocess.check_output(cmd, shell=True, text=True).strip()

def main():
    # Ensure we are branching off correctly
    try:
        run_cmd("git checkout -b arbitrum_upgrade")
    except subprocess.CalledProcessError:
        run_cmd("git checkout arbitrum_upgrade")

    # Get status
    status_raw = run_cmd("git status -s")
    if not status_raw:
        print("No changes to commit.")
        return

    # Parse files
    files = []
    for line in status_raw.split("\n"):
        line = line.strip()
        if not line: continue
        parts = line.split(" ", 1)
        if len(parts) < 2: continue
        
        # safely handle paths with spaces if any, though standard output may not be quoted unless needed
        file_path = parts[-1].strip()
        
        # Failsafe: Double check no `.env` or keys
        if ".env" in file_path or "keys" in file_path.lower():
            continue
            
        files.append(file_path)

    # Chunk into 5s
    chunks = [files[i:i + 5] for i in range(0, len(files), 5)]
    
    print(f"Divided {len(files)} files into {len(chunks)} chunks.")

    for idx, chunk in enumerate(chunks):
        print(f"\\n--- Processing Chunk {idx+1}/{len(chunks)} ---")
        
        # Analyze chunk to generate a detail message
        # We look at the paths to figure out a smart message
        comp_count = sum("components" in f for f in chunk)
        agent_count = sum("relayer" in f for f in chunk)
        contract_count = sum("contracts" in f for f in chunk)
        docs_count = sum(f.endswith(".md") or "docs" in f or "whitepaper" in f for f in chunk)
        lib_count = sum("lib" in f for f in chunk)
        
        if agent_count > 0:
            msg = "refactor: transition autonomous agent to pure risk underwriting algorithm (remove Aave logic)"
        elif contract_count > 0:
            msg = "feat(contracts): deploy Arbitrum Sepolia pure parametric architecture & remove Aave yield routers"
        elif docs_count > 0:
            msg = "docs: overhaul protocol documentation for Arbitrum ring-fenced risk model"
        elif comp_count > 0:
            msg = "refactor(ui): update dashboard and solver components for Aave-free parametric model"
        elif lib_count > 0:
            msg = "chore(frontend): update smart contract registry and Wagmi configs for Arbitrum Sepolia"
        else:
            msg = "refactor: system-wide transition to Arbitrum Sepolia architectural standard"
            
        # Add files safely
        for f in chunk:
            # Handle deleted files gracefully too
            run_cmd(f'git add "{f}"')
            
        # Commit
        print(f'Committing with message: {msg}')
        commit_cmd = f'git commit -m "{msg}" -m "File changes: {", ".join(chunk)}"'
        try:
            run_cmd(commit_cmd)
        except Exception as e:
            print(f"Commit failed or nothing to commit: {e}")
            continue
            
        # Push
        print("Pushing to arbitrum_upgrade branch...")
        try:
            run_cmd("git push -u origin arbitrum_upgrade")
        except Exception as e:
            print(f"Failed to push (might skip if no remote tracking): {e}")

        # Sleep logic: 5 minutes if not the last chunk
        if idx < len(chunks) - 1:
            print("Sleeping for 300 seconds (5 minutes) before next commit...")
            time.sleep(300)

    print("All chunks processed successfully!")

if __name__ == "__main__":
    main()
