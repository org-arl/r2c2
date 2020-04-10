# Branching Conventions

Please [follow the following guideline](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow) when contributing to the repo

In summary
1. Main collaboration branch is in **dev**. 
1. Codes/docs stable to be deployed, demo is in **master**.
1. Feature dev, testing, etc. is a **feature branch** from **dev**
1. Private branch that you don't want others to look is suffixed with **-priv**
1. Keep all exploratory works in separate folders
1. Each folder should have README.md about the folder.

## Quick Legend

| Instance                  | Branch         | Description, Instructions, Notes                            |
| ------------------------- | -------------- | ----------------------------------------------------------- |
| Stable                    | master         | Accepts merges from Development                             |
| Development               | dev            | Accepts merges from Features/Issues                         |
| Features/Issues           | feature-*      | Always branch off dev                                       |
| Features (Private branch) | feature_priv-* | Always branch off dev or feature-*. 						   |
