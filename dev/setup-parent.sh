#!/bin/bash

# sets up parent repo, on a branch of the original 0ad repo, for developing mod
# allows you to rebase onto latest revisions on master branch
# usage: setup-parent.sh DEST_DIR []

child_dir="$(realpath "$(dirname "$0")/../")"
parent_dir="$(realpath "$1")"
mod_dir="${parent_dir}/binaries/data/mods/public"

git_base_file="${child_dir}/dev/git_base.txt"

oad_git_server='git@github.com:0ad/0ad.git'
if [[ $2 ]]; then
	git_base="$2"
elif [[ -f "${git_base_file}" ]]; then
	git_base="$(grep -m 1 -o -e '^commit \S\+' < "${git_base_file}" | cut -c8-)"
	git_base_date="$(date --date="@$(( $(date --date="$(grep -m 1 -e '^Date:' < "${git_base_file}" | sed -e 's#^Date:\s*##')" '+%s') - ( 3600 * 24 ) ))" '+%Y-%m-%d')"
else
	git_base='master'
fi
[[ ! ${OAD_MOD_NAME} ]] && OAD_MOD_NAME='random_civ_groups'

oad_git_patch="${child_dir}/dev/patch"

if [[ ! ${parent_dir} ]]; then
	echo "usage: $(dirname $0)) DEST_DIR [GIT_BASE]" >&2
	exit 1
fi

# clone 0ad repo into parent dir if it doesn't already exist
if [[ ! -d "${parent_dir}" ]]; then
	echo "git base date: ${git_base_date}" >&2
	git clone $(if [[ ${git_base_date} ]]; then echo --shallow-since="${git_base_date}"; elif [[ "${git_base}" = 'master' ]]; then echo --depth=1; fi) "${oad_git_server}" "${parent_dir}"
fi

if [[ ! -d "${parent_dir}" ]]; then
	echo "ERROR: could not set up parent dir ${parent_dir}" >&2
	exit 1
fi

# setup new branch, save latest master commit to child dir dev files
cd "${parent_dir}"
# set git_base to exact commit hash
git_base="$(grep -m 1 -o -e '^commit \S\+' < "${git_base_file}" | cut -c8-)"
git switch master
# fetch commit in question if not present
if ! git log -n 1 --output=/dev/null "${git_base}"; then
	git fetch --shallow-since="${git_base_date}"
fi
git checkout "${git_base}"
git switch -c "${OAD_MOD_NAME}"

# apply patch if it exists, else port all files individually
if [[ -d "${oad_git_patch}" ]]; then
	git am --ignore-whitespace "${oad_git_patch}"/*
else
	cd "${child_dir}"
	IFS=$'\n\r'
	for file in $(find . -type f | cut -c3- | grep -v -e '^\.git'); do
		dir="$(dirname "${file}")"
		mod_dirname="${mod_dir}/${dir}"
		[[ ! -d "${mod_dirname}" ]] && mkdir -p "${mod_dirname}"
		cp -f "${file}" "${mod_dir}/${file}"
	done
fi

# copy dev scripts for parent into $parent_dir/dev
cp -rf "${child_dir}/dev/parent" "${parent_dir}/dev"

# append important variables to $parent_dir/dev/utils.sh
echo "\
OAD_PARENT_DIR=\"${parent_dir}\"
OAD_MOD_DIR=\"${mod_dir}\"
OAD_CHILD_DIR=\"${child_dir}\"
OAD_GIT_BASE_FILE=\"${child_dir}/dev/git_base.txt\"
OAD_GIT_PATCH=\"${oad_git_patch}\"
" >> "${parent_dir}/dev/utils.sh"
