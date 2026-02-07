# GitHub Workflow with Forks

## Creating a Branch
Before you start coding, you must create a new branch. This can be named anything but should indicate at a high level what is being coded. To create a branch, execute the following git command:
```
git switch -c <new-branch-name>
```
(Note: This is the modern equivalent to `git checkout -b <new-branch-name>`. It creates a new branch and switches to it, providing a clearer separation of concerns from other checkout uses.)

You can then use the following commands to switch back and forth between the `main` branch and your development branch.

```
git switch <new-branch-name>
git switch main
```

## Coding, Committing and Pushing Your Work to GitHub
<span style="color: red;">NOTE: DO NOT ADD OR MODIFY CODE IN THE MAIN BRANCH.  ALWAYS WORK IN YOUR DEVELOPMENT BRANCH</span>

### Check Your Current Branch
First, make sure you are in your development branch by running the following command:
```
git branch
```
The current branch will appear in green as shown in the example below.<br>
![alt text](./images/git-branch.png "git branch output")<br>
If this is not the correct branch, use `git switch <branch-name>` as shown above.<br>

### Committing Your Work
Once you are in the correct branch, commit to your working branch often! This is easily done in VS Code by selecting the Source Control section of the left sidebar, entering a commit message and pressing the Commit button.  This is shown in the image below:<br>
![alt text](./images/commit.png "git commit in VSCode")<br>

## Pushing your Work to GitHub
The first time you push your working branch to GitHub, you will need to push with the following command in order to track your local branch with its equivalent in origin (GitHub). Run the command below to push with tracking: 
```
git push -u origin <new-branch-name>
```

All subsequent pushes can perfomed by



## Git Command Details

After you make your commit and publish your branch, and make your PR, and once it's merged into upstream main, you will need to make sure that you update your origin and local repo:

#### One way of updating local and origin main:

```shell
git fetch upstream
```
- This downloads all the latest commits from the upstream repository (the original repo you forked) but does not change your local branches yet.
- It updates your remote-tracking branches like upstream/main.

```shell
git checkout main
```
- Switches your local branch to main (your fork’s main branch is usually tracking origin/main).

```shell
git merge upstream/main
```
- This merges the latest upstream main into your local main.
- After this step, your local main contains all the commits from upstream.

```shell
git push origin main
```
- Pushes your updated local main to your fork on GitHub (origin/main).
- Now your fork’s main is fully in sync with upstream.

#### The Full Stack course way of updating local and origin main:

```shell
git switch main
git pull upstream main
git push origin main
```

Do each of these commands after every PR merge.

**Be sure to create your new branch before you start work again.**
I strongly recommend deleting your old branch.

If you ever want to make sure that you're pushing to origin and not upstream, check with this:
```shell
git branch -vv
```
