# Branching Conventions

Please [follow the following guideline](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow) when contributing to the repo

In summary
1. Main collaboration branch is in **dev**. 
1. Codes/docs stable to be deployed, demo is in **master**.
1. Feature dev, testing, etc. is a **feature branch** from **dev**
1. Private branch that you don't want others to look is suffixed with **-priv**
1. Keep all exploratory works in separate folders
1. Each folder should have README.md about the folder.
1. Example of working on a branch
   1. **Create new feature branch** 
   
      git checkout dev; git pull #Update the dev for latest code 
   
      git branch feature/<feature_name> #Create features branch from it
   1. **Checkout your new branch, work on it, commit as usual**
   1. **Set up and push feature branch to github, if you choose to** 
   
      git push --set-upstream origin feature/<feature_name>
      
      <dev, commit, push as usual>
   1. **Merge into dev when complete**
   
      git checkout dev; git pull #Update the dev for latest code 
      
      git merge feature/<feature_name> #merge the feature into dev
   1. **Push the dev into remote & create pull request**
     
      git push
      
      Goto github, create pull request of the pending merge


## Quick Legend

| Instance                  | Branch          | Description, Instructions, Notes                            |
| ------------------------- | --------------  | ----------------------------------------------------------- |
| Stable                    | master          | Accepts merges from Development                             |
| Development               | dev             | Accepts merges from Features/Issues                         |
| Features/Issues           | feature\/*      | Always branch off dev                                       |
| Features (Private branch) | feature\/*-priv | Always branch off dev or feature\/*                         |
